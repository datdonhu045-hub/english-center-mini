import { USE_MOCK_API } from '@/services/api/apiConfig'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { ApiClientError, httpClient } from '@/services/api/httpClient'
import { mockDelay } from '@/services/api/mockUtils'
import type {
  ExerciseAttemptResult,
  QuestionReviewItem,
  StudyExercise,
  StudyTopic,
  StudyZoneCategory,
  SubmitExercisePayload,
} from '@/features/study-zone/types'

export const studyZoneApi = {
  /**
   * Lấy danh sách chủ đề theo danh mục (grammar | vocabulary | listening)
   * Chỉ trả về các chủ đề đã được Admin công khai (isPublished === true)
   */
  async getTopics(category?: StudyZoneCategory): Promise<StudyTopic[]> {
    if (!USE_MOCK_API) {
      const list = await httpClient.get<StudyTopic[]>(API_ENDPOINTS.studyZone.topicsList, {
        category,
      })
      return list
        .filter((t) => t.isPublished && (!category || t.category === category))
        .sort((a, b) => a.orderNumber - b.orderNumber)
    }

    await mockDelay(180)
    const { initialStudyTopics } = await import('@/features/study-zone/mocks/studyZoneMockData')
    return initialStudyTopics
      .filter((t) => t.isPublished && (!category || t.category === category))
      .sort((a, b) => a.orderNumber - b.orderNumber)
  },

  /**
   * Lấy chi tiết bài học / chủ đề theo slug và danh mục
   */
  async getTopicBySlug(slug: string, category?: StudyZoneCategory): Promise<StudyTopic | null> {
    if (!USE_MOCK_API) {
      try {
        const topic = await httpClient.get<StudyTopic | null>(
          API_ENDPOINTS.studyZone.topicDetailBySlug(slug),
          { category },
        )
        if (!topic || !topic.isPublished) return null
        if (category && topic.category !== category) return null
        return topic
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) return null
        throw err
      }
    }

    await mockDelay(160)
    const { initialStudyTopics } = await import('@/features/study-zone/mocks/studyZoneMockData')
    return (
      initialStudyTopics.find(
        (t) => t.slug === slug && t.isPublished && (!category || t.category === category),
      ) ?? null
    )
  },

  /**
   * Lấy đề bài tập trắc nghiệm theo ID.
   * Dữ liệu trả về chỉ gồm câu hỏi (content blocks: text/image/audio) và các lựa chọn A, B, C, D.
   * Không bao giờ trả về đáp án đúng trước khi học viên nộp bài.
   */
  async getExerciseById(exerciseId: string): Promise<StudyExercise | null> {
    if (!USE_MOCK_API) {
      try {
        return await httpClient.get<StudyExercise | null>(
          API_ENDPOINTS.studyZone.exerciseDetail(exerciseId),
        )
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) return null
        throw err
      }
    }

    await mockDelay(180)
    const { initialStudyExercises } = await import('@/features/study-zone/mocks/studyZoneMockData')
    const found = initialStudyExercises.find((ex) => ex.id === exerciseId)
    if (!found) return null

    return {
      ...found,
      questions: [...found.questions].sort((a, b) => a.displayOrder - b.displayOrder),
    }
  },

  /**
   * Nộp bài và chấm điểm.
   * - Khi nối Backend thật: gửi POST /public/study-zone/exercises/:id/submit để Backend chấm điểm và trả về kết quả + lời giải.
   * - Khi chạy chế độ Mock: đối chiếu với `serverAnswerKeys` tách riêng và tạo một lượt làm bài mới (`attemptId` duy nhất).
   */
  async submitExercise(payload: SubmitExercisePayload): Promise<ExerciseAttemptResult> {
    if (!USE_MOCK_API) {
      return httpClient.post<ExerciseAttemptResult>(
        API_ENDPOINTS.studyZone.submitExercise(payload.exerciseId),
        payload,
      )
    }

    await mockDelay(320)
    const { initialStudyExercises, serverAnswerKeys } = await import(
      '@/features/study-zone/mocks/studyZoneMockData'
    )

    const exercise = initialStudyExercises.find((ex) => ex.id === payload.exerciseId)
    if (!exercise) {
      throw new Error('Không tìm thấy bài tập để chấm điểm.')
    }

    const totalQuestions = exercise.questions.length
    let answeredCount = 0
    let correctCount = 0
    const reviews: Record<string, QuestionReviewItem> = {}

    for (const q of exercise.questions) {
      const selectedOptionId = payload.answers[q.id] ?? null
      if (selectedOptionId) answeredCount += 1

      const key = serverAnswerKeys[q.id]
      const correctOptionId = key?.correctOptionId ?? q.options[0]?.id ?? ''
      const isCorrect = Boolean(selectedOptionId && selectedOptionId === correctOptionId)
      if (isCorrect) correctCount += 1

      reviews[q.id] = {
        questionId: q.id,
        selectedOptionId,
        correctOptionId,
        isCorrect,
        explanation:
          key?.explanation ??
          'Đáp án đúng được xác định dựa trên ngữ cảnh và quy tắc ngữ pháp/từ vựng chuẩn TOEIC.',
        audioTranscript: key?.audioTranscript,
        audioTranslation: key?.audioTranslation,
      }
    }

    const unansweredCount = Math.max(0, totalQuestions - answeredCount)
    const incorrectCount = Math.max(0, totalQuestions - correctCount)
    const accuracyPercent =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
    const scoreTen =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) / 10 : 0

    return {
      attemptId: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      exerciseId: payload.exerciseId,
      submittedAt: new Date().toISOString(),
      totalQuestions,
      answeredCount,
      unansweredCount,
      correctCount,
      incorrectCount,
      scoreTen,
      accuracyPercent,
      durationSeconds: payload.durationSeconds,
      reviews,
    }
  },
}
