import { USE_MOCK_API } from '@/services/api/apiConfig'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { ApiClientError, httpClient } from '@/services/api/httpClient'
import { mockDelay } from '@/services/api/mockUtils'
import { authSessionStore } from '@/features/auth/services/authService'
import { mockTests } from '@/features/test-online/mocks/testMockData'
import { attemptStorageService } from '@/features/test-online/services/attemptService'
import type {
  AudioPlaybackStatus,
  StartAttemptPayload,
  TestAttempt,
  TestAttemptResult,
  ToeicPartNumber,
} from '@/features/test-online/types/test.types'

function isAttemptOwnedByCurrentUser(attempt: TestAttempt): boolean {
  const currentUserId = authSessionStore.getCurrentUser()?.id ?? 'guest'
  const ownerId = attempt.studentId ?? 'stu-001'
  return ownerId === currentUserId
}

export const attemptApi = {
  /**
   * Kiểm tra xem học viên hiện tại có lượt thi nào đang làm dở (`in_progress`) của đề thi này không.
   */
  async findInProgressAttemptByTestSlug(
    testSlug: string,
    studentId?: string,
  ): Promise<TestAttempt | null> {
    if (!USE_MOCK_API) {
      return null
    }
    const map = attemptStorageService.getAllAttemptsMap()
    const effectiveStudentId = studentId ?? 'guest'
    const candidates = Object.values(map)
      .filter((att) => {
        if (att.testSlug !== testSlug || att.status !== 'in_progress') return false
        const owner = att.studentId ?? 'stu-001'
        return owner === effectiveStudentId
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    return candidates[0] ?? null
  },

  /**
   * Hủy/bỏ lượt thi đang làm dở khi học viên chọn "HỦY" trong hộp thoại tiếp tục bài thi.
   */
  async discardInProgressAttempt(attemptId: string): Promise<void> {
    if (!USE_MOCK_API) return
    const existing = attemptStorageService.getAttemptById(attemptId)
    if (!existing || existing.status !== 'in_progress') return
    attemptStorageService.saveAttempt({
      ...existing,
      status: 'expired',
      submittedAt: new Date().toISOString(),
    })
  },

  /**
   * Khởi tạo một lượt thi mới (tạo Attempt ID mới, ghi nhận startedAt & deadlineAt).
   */
  async startAttempt(payload: StartAttemptPayload): Promise<TestAttempt> {
    if (!USE_MOCK_API) {
      return httpClient.post<TestAttempt>(API_ENDPOINTS.testOnline.startAttempt, payload)
    }
    await mockDelay(100)
    const test = mockTests.find(
      (t) => (t.id === payload.testId || t.slug === payload.testSlug) && t.status === 'published',
    )
    if (!test) {
      throw new Error('Không tìm thấy đề thi hợp lệ để bắt đầu lượt thi.')
    }
    return attemptStorageService.createNewAttempt(test, payload)
  },

  /**
   * Lấy thông tin lượt thi đang diễn ra hoặc đã hoàn thành theo Attempt ID.
   */
  async getAttemptById(attemptId: string): Promise<TestAttempt | null> {
    if (!USE_MOCK_API) {
      try {
        return await httpClient.get<TestAttempt>(API_ENDPOINTS.testOnline.attemptDetail(attemptId))
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) return null
        throw err
      }
    }
    await mockDelay(60)
    const found = attemptStorageService.getAttemptById(attemptId)
    if (!found || !isAttemptOwnedByCurrentUser(found)) return null
    return found
  },

  /**
   * Lưu tiến độ làm bài (đáp án đã chọn, câu đánh dấu xem lại, Part đang đứng, giai đoạn giới thiệu/câu hỏi).
   */
  async saveAttemptProgress(
    attemptId: string,
    patch: Partial<
      Pick<
        TestAttempt,
        | 'answers'
        | 'flaggedQuestionIds'
        | 'introducedParts'
        | 'currentPartNumber'
        | 'currentStage'
        | 'currentQuestionId'
        | 'listeningCompleted'
        | 'listeningJustCompletedNotice'
      >
    >,
  ): Promise<TestAttempt> {
    if (!USE_MOCK_API) {
      return httpClient.post<TestAttempt>(API_ENDPOINTS.testOnline.saveProgress(attemptId), patch)
    }

    const current = attemptStorageService.getAttemptById(attemptId)
    if (!current) {
      throw new Error('Không tìm thấy lượt thi.')
    }
    if (current.status !== 'in_progress') {
      return current
    }

    let nextDeadlineAt = current.deadlineAt
    if (patch.currentStage === 'questions' && current.timerPausedAt) {
      const pausedMs = Math.max(0, Date.now() - new Date(current.timerPausedAt).getTime())
      nextDeadlineAt = new Date(new Date(current.deadlineAt).getTime() + pausedMs).toISOString()
    }

    const updated: TestAttempt = {
      ...current,
      ...patch,
      deadlineAt: nextDeadlineAt,
      // Nếu chuyển sang màn hình giới thiệu Part thì tạm dừng đồng hồ để không tính thời gian đọc giới thiệu
      timerPausedAt:
        patch.currentStage === 'part_intro'
          ? (current.timerPausedAt ?? new Date().toISOString())
          : patch.currentStage === 'questions'
            ? undefined
            : current.timerPausedAt,
    }
    return attemptStorageService.saveAttempt(updated)
  },

  /**
   * Cập nhật trạng thái phát 1 lần của nhóm Audio trong phần Listening.
   */
  async updateAudioStatus(
    attemptId: string,
    audioGroupId: string,
    status: AudioPlaybackStatus,
  ): Promise<TestAttempt | null> {
    if (!USE_MOCK_API) {
      return httpClient.post<TestAttempt>(API_ENDPOINTS.testOnline.saveProgress(attemptId), {
        audioGroupId,
        status,
      })
    }
    return attemptStorageService.updateAudioGroupStatus(attemptId, audioGroupId, status)
  },

  /**
   * Đánh dấu học viên đã đọc màn hình giới thiệu của một Part và nhấn "Bắt đầu Part".
   * Bù lại toàn bộ khoảng thời gian đã dừng ở màn hình giới thiệu vào `deadlineAt` để không mất 1 giây làm bài nào.
   */
  async confirmPartIntroduction(
    attemptId: string,
    partNumber: ToeicPartNumber,
    firstQuestionId?: string,
  ): Promise<TestAttempt> {
    if (!USE_MOCK_API) {
      return httpClient.post<TestAttempt>(API_ENDPOINTS.testOnline.saveProgress(attemptId), {
        action: 'confirm_part_intro',
        partNumber,
        firstQuestionId,
      })
    }

    const current = attemptStorageService.getAttemptById(attemptId)
    if (!current) {
      throw new Error('Không tìm thấy lượt thi.')
    }
    if (current.status !== 'in_progress') {
      return current
    }

    let nextDeadlineAt = current.deadlineAt
    if (current.timerPausedAt) {
      const pausedMs = Math.max(0, Date.now() - new Date(current.timerPausedAt).getTime())
      nextDeadlineAt = new Date(new Date(current.deadlineAt).getTime() + pausedMs).toISOString()
    }

    const nextIntroduced = Array.from(new Set([...current.introducedParts, partNumber]))
    const updated: TestAttempt = {
      ...current,
      deadlineAt: nextDeadlineAt,
      timerPausedAt: undefined,
      introducedParts: nextIntroduced,
      currentPartNumber: partNumber,
      currentStage: 'questions',
      currentQuestionId: firstQuestionId ?? current.currentQuestionId,
      listeningJustCompletedNotice: false,
    }
    return attemptStorageService.saveAttempt(updated)
  },

  /**
   * Nộp bài thi chính thức hoặc tự động kết thúc khi hết giờ (expired).
   */
  async submitAttempt(
    attemptId: string,
    reason: 'submitted' | 'expired' = 'submitted',
  ): Promise<TestAttemptResult> {
    if (!USE_MOCK_API) {
      return httpClient.post<TestAttemptResult>(API_ENDPOINTS.testOnline.submitAttempt(attemptId), {
        reason,
      })
    }
    await mockDelay(140)
    const attempt = attemptStorageService.getAttemptById(attemptId)
    if (!attempt) {
      throw new Error('Không tìm thấy lượt thi cần nộp.')
    }
    const test = mockTests.find((t) => t.id === attempt.testId || t.slug === attempt.testSlug)
    if (!test) {
      throw new Error('Không tìm thấy dữ liệu đề thi để chấm điểm.')
    }
    return attemptStorageService.finalizeAttempt(test, attemptId, reason)
  },

  /**
   * Lấy kết quả chấm điểm chi tiết của một lượt thi.
   */
  async getAttemptResult(attemptId: string): Promise<TestAttemptResult | null> {
    if (!USE_MOCK_API) {
      try {
        return await httpClient.get<TestAttemptResult>(
          API_ENDPOINTS.testOnline.attemptResult(attemptId),
        )
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) return null
        throw err
      }
    }
    await mockDelay(80)
    const attempt = attemptStorageService.getAttemptById(attemptId)
    if (!attempt || !isAttemptOwnedByCurrentUser(attempt)) return null
    return attemptStorageService.getResultByAttemptId(attemptId)
  },
}
