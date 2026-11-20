import { mockTests } from '@/features/test-online/mocks/testMockData'
import { gradeTestAttempt } from '@/features/test-online/services/scoringService'
import type {
  AudioGroupState,
  AudioPlaybackStatus,
  StartAttemptPayload,
  Test,
  TestAttempt,
  TestAttemptResult,
  ToeicPartNumber,
} from '@/features/test-online/types/test.types'

const ATTEMPTS_STORAGE_KEY = 'ec_toeic_test_attempts_v2'
const RESULTS_STORAGE_KEY = 'ec_toeic_test_results_v2'
const SEEDED_FLAG_KEY = 'ec_toeic_test_seeded_v2'

// Bộ nhớ đệm dự phòng trong RAM phòng trường hợp LocalStorage của trình duyệt bị đầy quota
const memoryAttemptsFallback: Record<string, TestAttempt> = {}
const memoryResultsFallback: Record<string, TestAttemptResult> = {}

function safeReadJson<T extends Record<string, unknown>>(
  key: string,
  fallback: T,
  memoryStore: T,
): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return { ...fallback, ...memoryStore }
    const parsed = JSON.parse(raw) as T
    return { ...parsed, ...memoryStore }
  } catch {
    return { ...fallback, ...memoryStore }
  }
}

function safeWriteJson<T extends Record<string, unknown>>(
  key: string,
  value: T,
  memoryStore: T,
): void {
  Object.assign(memoryStore, value)
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Nếu LocalStorage bị đầy do các bản ghi cũ lưu chuỗi audio dài, tự động dọn bớt audioUrl và lưu lại
    try {
      window.localStorage.removeItem(key)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Đã có memoryStore giữ dữ liệu trong phiên làm việc hiện tại
    }
  }
}

function buildInitialAudioStates(
  test: Test,
  selectedParts: ToeicPartNumber[],
): Record<string, AudioGroupState> {
  const states: Record<string, AudioGroupState> = {}
  const selectedSet = new Set(selectedParts)

  for (const part of test.parts) {
    if (!selectedSet.has(part.partNumber) || part.section !== 'listening') continue
    for (const group of part.questionGroups) {
      const audioBlock = group.stimulus.find((b) => b.type === 'audio')
      if (!audioBlock || audioBlock.type !== 'audio') continue
      const groupId = group.audioGroupId ?? group.id
      states[groupId] = {
        audioGroupId: groupId,
        partNumber: part.partNumber,
        // Không lưu chuỗi base64 WAV dài vào LocalStorage để tránh tràn bộ nhớ 5MB của trình duyệt
        audioUrl: '',
        status: 'NOT_PLAYED',
      }
    }
  }

  return states
}

/**
 * Khởi tạo 2 lượt thi mẫu trong lịch sử (Lần 1 và Lần 2 của TEST 1 – 2026)
 * để trang Lịch sử làm bài (/test-history) có sẵn dữ liệu đối chiếu tiến bộ của học viên.
 */
function ensureSeededSampleHistory(): void {
  if (typeof window === 'undefined') return
  const alreadySeeded = window.localStorage.getItem(SEEDED_FLAG_KEY)
  if (alreadySeeded) return

  const test1 = mockTests[0]
  if (!test1) return

  const existingAttempts = safeReadJson<Record<string, TestAttempt>>(
    ATTEMPTS_STORAGE_KEY,
    {},
    memoryAttemptsFallback,
  )
  const existingResults = safeReadJson<Record<string, TestAttemptResult>>(
    RESULTS_STORAGE_KEY,
    {},
    memoryResultsFallback,
  )

  const attempt1Id = 'ATT-20261110-101'
  const attempt1: TestAttempt = {
    id: attempt1Id,
    testId: test1.id,
    testSlug: test1.slug,
    testCode: test1.code,
    testTitle: test1.title,
    practiceMode: 'full',
    selectedParts: [1, 2, 3, 4, 5, 6, 7],
    selectedDuration: 120,
    startedAt: '2026-11-10T14:00:00.000Z',
    deadlineAt: '2026-11-10T16:00:00.000Z',
    submittedAt: '2026-11-10T14:48:20.000Z',
    status: 'submitted',
    answers: {
      't01-q1': 't01-q1-b',
      't01-q2': 't01-q2-c',
      't01-q3': 't01-q3-a',
      't01-q4': 't01-q4-a',
      't01-q5': 't01-q5-b',
      't01-q6': 't01-q6-b',
      't01-q7': 't01-q7-c',
      't01-q8': 't01-q8-a',
      't01-q9': 't01-q9-c',
      't01-q10': 't01-q10-b',
      't01-q11': 't01-q11-a',
      't01-q12': 't01-q12-b',
      't01-q13': 't01-q13-a',
      't01-q14': 't01-q14-a',
      't01-q15': 't01-q15-a',
      't01-q16': 't01-q16-b',
      't01-q17': 't01-q17-c',
      't01-q18': 't01-q18-b',
    },
    flaggedQuestionIds: ['t01-q7', 't01-q13'],
    audioStates: buildInitialAudioStates(test1, [1, 2, 3, 4, 5, 6, 7]),
    introducedParts: [1, 2, 3, 4, 5, 6, 7],
    currentPartNumber: 7,
    currentStage: 'questions',
    listeningCompleted: true,
  }
  const result1 = gradeTestAttempt(test1, attempt1, 'submitted', attempt1.submittedAt!)

  const attempt2Id = 'ATT-20261116-205'
  const attempt2: TestAttempt = {
    id: attempt2Id,
    testId: test1.id,
    testSlug: test1.slug,
    testCode: test1.code,
    testTitle: test1.title,
    practiceMode: 'custom_parts',
    selectedParts: [5, 6, 7],
    selectedDuration: 45,
    startedAt: '2026-11-16T19:30:00.000Z',
    deadlineAt: '2026-11-16T20:15:00.000Z',
    submittedAt: '2026-11-16T19:52:10.000Z',
    status: 'submitted',
    answers: {
      't01-q11': 't01-q11-a',
      't01-q12': 't01-q12-b',
      't01-q13': 't01-q13-b',
      't01-q14': 't01-q14-a',
      't01-q15': 't01-q15-a',
      't01-q16': 't01-q16-b',
      't01-q17': 't01-q17-c',
      't01-q18': 't01-q18-a',
    },
    flaggedQuestionIds: [],
    audioStates: {},
    introducedParts: [5, 6, 7],
    currentPartNumber: 7,
    currentStage: 'questions',
    listeningCompleted: true,
  }
  const result2 = gradeTestAttempt(test1, attempt2, 'submitted', attempt2.submittedAt!)

  existingAttempts[attempt1Id] = attempt1
  existingAttempts[attempt2Id] = attempt2
  existingResults[attempt1Id] = result1
  existingResults[attempt2Id] = result2

  safeWriteJson(ATTEMPTS_STORAGE_KEY, existingAttempts, memoryAttemptsFallback)
  safeWriteJson(RESULTS_STORAGE_KEY, existingResults, memoryResultsFallback)
  try {
    window.localStorage.setItem(SEEDED_FLAG_KEY, '1')
  } catch {
    // ignore
  }
}

export const attemptStorageService = {
  getAllAttemptsMap(): Record<string, TestAttempt> {
    ensureSeededSampleHistory()
    const rawMap = safeReadJson<Record<string, TestAttempt>>(
      ATTEMPTS_STORAGE_KEY,
      {},
      memoryAttemptsFallback,
    )
    // Tự động làm sạch các chuỗi audioUrl base64 cũ nếu đã lưu trong LocalStorage trước đó
    let cleaned = false
    for (const att of Object.values(rawMap)) {
      if (att.audioStates) {
        for (const st of Object.values(att.audioStates)) {
          if (st.audioUrl && st.audioUrl.length > 200) {
            st.audioUrl = ''
            cleaned = true
          }
        }
      }
    }
    if (cleaned) {
      safeWriteJson(ATTEMPTS_STORAGE_KEY, rawMap, memoryAttemptsFallback)
    }
    return rawMap
  },

  getAllResultsMap(): Record<string, TestAttemptResult> {
    ensureSeededSampleHistory()
    return safeReadJson<Record<string, TestAttemptResult>>(
      RESULTS_STORAGE_KEY,
      {},
      memoryResultsFallback,
    )
  },

  getAttemptById(attemptId: string): TestAttempt | null {
    const map = this.getAllAttemptsMap()
    return map[attemptId] ?? null
  },

  saveAttempt(attempt: TestAttempt): TestAttempt {
    const map = this.getAllAttemptsMap()
    map[attempt.id] = attempt
    safeWriteJson(ATTEMPTS_STORAGE_KEY, map, memoryAttemptsFallback)
    return attempt
  },

  createNewAttempt(test: Test, payload: StartAttemptPayload): TestAttempt {
    ensureSeededSampleHistory()
    const sortedParts = [...payload.selectedParts].sort((a, b) => a - b) as ToeicPartNumber[]
    const firstPart = sortedParts[0] ?? 1
    const hasListening = sortedParts.some((p) => p <= 4)

    const now = new Date()
    const startedAt = now.toISOString()
    const deadlineAt = new Date(now.getTime() + payload.selectedDuration * 60 * 1000).toISOString()

    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const dateStamp = startedAt.slice(0, 10).replace(/-/g, '')
    const attemptId = `ATT-${dateStamp}-${randomSuffix}`

    const attempt: TestAttempt = {
      id: attemptId,
      testId: test.id,
      testSlug: test.slug,
      testCode: test.code,
      testTitle: test.title,
      practiceMode: payload.practiceMode,
      selectedParts: sortedParts,
      selectedDuration: payload.selectedDuration,
      startedAt,
      deadlineAt,
      // Bắt đầu ở màn hình giới thiệu Part đầu tiên -> đồng hồ tạm dừng, chỉ tính giờ khi nhấn Bắt đầu Part
      timerPausedAt: startedAt,
      status: 'in_progress',
      answers: {},
      flaggedQuestionIds: [],
      audioStates: buildInitialAudioStates(test, sortedParts),
      introducedParts: [],
      currentPartNumber: firstPart,
      currentStage: 'part_intro',
      listeningCompleted: !hasListening,
      listeningJustCompletedNotice: false,
    }

    return this.saveAttempt(attempt)
  },

  updateAudioGroupStatus(
    attemptId: string,
    audioGroupId: string,
    nextStatus: AudioPlaybackStatus,
  ): TestAttempt | null {
    const attempt = this.getAttemptById(attemptId)
    if (!attempt || attempt.status !== 'in_progress') return attempt

    const currentGroup = attempt.audioStates[audioGroupId]
    if (!currentGroup) return attempt

    // Quy tắc bất biến: Đã LOCKED hoặc COMPLETED thì không bao giờ quay lại PLAYING hay NOT_PLAYED
    if (
      (currentGroup.status === 'LOCKED' || currentGroup.status === 'COMPLETED') &&
      (nextStatus === 'PLAYING' || nextStatus === 'NOT_PLAYED')
    ) {
      return attempt
    }

    const nowIso = new Date().toISOString()
    const updatedGroup: AudioGroupState = {
      ...currentGroup,
      status: nextStatus === 'COMPLETED' ? 'LOCKED' : nextStatus,
      startedAt:
        nextStatus === 'PLAYING' && !currentGroup.startedAt ? nowIso : currentGroup.startedAt,
      completedAt:
        nextStatus === 'COMPLETED' || nextStatus === 'LOCKED'
          ? currentGroup.completedAt ?? nowIso
          : currentGroup.completedAt,
    }

    const nextAudioStates = {
      ...attempt.audioStates,
      [audioGroupId]: updatedGroup,
    }

    // Kiểm tra xem tất cả các nhóm audio Listening đã LOCKED hết chưa
    const allListeningGroups = Object.values(nextAudioStates)
    const allDone =
      allListeningGroups.length === 0 ||
      allListeningGroups.every((g) => g.status === 'LOCKED' || g.status === 'COMPLETED')

    const nextAttempt: TestAttempt = {
      ...attempt,
      audioStates: nextAudioStates,
      listeningCompleted: attempt.listeningCompleted || allDone,
    }

    return this.saveAttempt(nextAttempt)
  },

  finalizeAttempt(
    test: Test,
    attemptId: string,
    finalStatus: 'submitted' | 'expired',
  ): TestAttemptResult {
    const map = this.getAllAttemptsMap()
    const attempt = map[attemptId]
    if (!attempt) {
      throw new Error('Không tìm thấy lượt thi để chấm điểm.')
    }

    const existingResults = this.getAllResultsMap()
    // Không cho phép nộp lại / ghi đè một lượt thi đã hoàn thành
    if (attempt.status !== 'in_progress' && existingResults[attemptId]) {
      return existingResults[attemptId]
    }

    const submittedAtIso = new Date().toISOString()
    const lockedAudioStates: Record<string, AudioGroupState> = {}
    for (const [k, v] of Object.entries(attempt.audioStates)) {
      lockedAudioStates[k] = { ...v, status: 'LOCKED' }
    }

    const finalizedAttempt: TestAttempt = {
      ...attempt,
      status: finalStatus,
      submittedAt: submittedAtIso,
      audioStates: lockedAudioStates,
    }
    map[attemptId] = finalizedAttempt
    safeWriteJson(ATTEMPTS_STORAGE_KEY, map, memoryAttemptsFallback)

    const result = gradeTestAttempt(test, finalizedAttempt, finalStatus, submittedAtIso)
    existingResults[attemptId] = result
    safeWriteJson(RESULTS_STORAGE_KEY, existingResults, memoryResultsFallback)

    return result
  },

  getResultByAttemptId(attemptId: string): TestAttemptResult | null {
    const results = this.getAllResultsMap()
    return results[attemptId] ?? null
  },
}
