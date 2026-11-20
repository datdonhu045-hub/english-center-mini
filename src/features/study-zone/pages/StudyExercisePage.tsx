import { useEffect, useState } from 'react'
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock,
  LayoutGrid,
  RotateCcw,
  X,
} from 'lucide-react'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { usePageTitle } from '@/hooks/usePageTitle'
import { studyZoneApi } from '@/features/study-zone/api/studyZoneApi'
import { useStudyExercise } from '@/features/study-zone/hooks/useStudyZone'
import QuestionRenderer from '@/features/study-zone/components/QuestionRenderer'
import QuestionNavigator from '@/features/study-zone/components/QuestionNavigator'
import SubmissionModal from '@/features/study-zone/components/SubmissionModal'
import ExerciseResultBanner from '@/features/study-zone/components/ExerciseResultBanner'
import ExitExamConfirmModal from '@/features/test-online/components/ExitExamConfirmModal'
import {
  STUDY_CATEGORY_LABELS,
  STUDY_CATEGORY_PATHS,
  type ExerciseAttemptResult,
} from '@/features/study-zone/types'

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Trang Làm bài & Xem kết quả bài tập trắc nghiệm đa phương tiện (/study-zone/practice/:exerciseId).
 * - Độc lập toàn màn hình (không có Header & Footer website).
 * - Tự động cuộn lên đầu trang khi mở bài tập hoặc khi chuyển câu hỏi.
 * - Chuyển từng câu 1 với nút CÂU TRƯỚC / CÂU TIẾP đặt ngay phía trên câu hỏi.
 * - Có hộp thoại xác nhận khi đang làm bài dở mà bấm thoát ra ngoài.
 */
export default function StudyExercisePage() {
  const { exerciseId = '' } = useParams()
  const navigate = useNavigate()
  const { data: exercise, loading, error, retry } = useStudyExercise(exerciseId)

  usePageTitle(exercise ? `${exercise.title} – ${exercise.subtitle}` : 'Làm bài tập Study Zone')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [exitModalOpen, setExitModalOpen] = useState(false)
  const [allowLeaveWithoutPrompt, setAllowLeaveWithoutPrompt] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [navDrawerOpen, setNavDrawerOpen] = useState(false)

  const [attemptHistory, setAttemptHistory] = useState<ExerciseAttemptResult[]>([])
  const [viewingAttemptIndex, setViewingAttemptIndex] = useState<number | null>(null)

  const activeResult =
    viewingAttemptIndex !== null ? (attemptHistory[viewingAttemptIndex] ?? null) : null
  const previousResult =
    viewingAttemptIndex !== null && viewingAttemptIndex > 0
      ? attemptHistory[viewingAttemptIndex - 1]
      : null
  const isSubmitted = Boolean(activeResult)

  const isDoingExercise = Boolean(
    exercise && !isSubmitted && !submitting && !allowLeaveWithoutPrompt,
  )

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDoingExercise && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!isDoingExercise) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDoingExercise])

  // Luôn cuộn lên đầu trang khi mở trang bài tập hoặc khi chuyển câu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [exerciseId, currentIndex, isSubmitted])

  // Bộ đếm thời gian khi đang làm bài
  useEffect(() => {
    if (!exercise || isSubmitted) return
    const interval = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [exercise, isSubmitted])

  if (loading) {
    return (
      <div className="ec-font min-h-screen bg-[#F5FAFE] pb-16">
        <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <LoadingBlock label="Đang tải đề bài tập..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ec-font min-h-screen bg-[#F5FAFE] pb-16">
        <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <ErrorBlock message={error} onRetry={retry} />
        </div>
      </div>
    )
  }

  if (!exercise || exercise.questions.length === 0) {
    return (
      <div className="ec-font min-h-screen bg-[#F5FAFE] pb-16">
        <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
          <EmptyBlock
            title="Không tìm thấy bài tập hoặc câu hỏi"
            description="Bài tập bạn truy cập không tồn tại hoặc đang được cập nhật câu hỏi."
            action={
              <Link
                to="/study-zone/grammar"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#2878B8] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1f5f94]"
              >
                <ArrowLeft className="h-4 w-4" /> Về Study Zone
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const questions = exercise.questions
  const totalQuestions = questions.length
  const safeIndex = Math.min(Math.max(0, currentIndex), totalQuestions - 1)
  const currentQuestion = questions[safeIndex]
  const answeredCount = Object.keys(answers).length

  const totalAllowedSeconds = (exercise.durationMinutes ?? 10) * 60
  const remainingSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds)

  const topicPath = `${STUDY_CATEGORY_PATHS[exercise.category]}/${exercise.topicSlug}`

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }))
  }

  const handleConfirmSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await studyZoneApi.submitExercise({
        exerciseId: exercise.id,
        answers,
        durationSeconds: Math.max(1, elapsedSeconds),
      })
      setAttemptHistory((prev) => {
        const next = [...prev, result]
        setViewingAttemptIndex(next.length - 1)
        return next
      })
      setConfirmOpen(false)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Không thể nộp bài lúc này. Vui lòng thử lại.',
      )
      setConfirmOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartNewAttempt = () => {
    setViewingAttemptIndex(null)
    setAnswers({})
    setCurrentIndex(0)
    setElapsedSeconds(0)
    setSubmitError(null)
    window.scrollTo({ top: 0 })
  }

  const handleRequestExit = () => {
    if (isSubmitted) {
      navigate(topicPath)
      return
    }
    setExitModalOpen(true)
  }

  const handleConfirmExit = () => {
    if (blocker.state === 'blocked') {
      setExitModalOpen(false)
      blocker.proceed()
      return
    }
    setAllowLeaveWithoutPrompt(true)
    setExitModalOpen(false)
    navigate(topicPath)
  }

  const handleCancelExit = () => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
    setExitModalOpen(false)
  }

  const currentReview = activeResult?.reviews[currentQuestion.id]
  const selectedForDisplay = isSubmitted
    ? (currentReview?.selectedOptionId ?? null)
    : (answers[currentQuestion.id] ?? null)

  return (
    <div className="ec-reading-font min-h-screen bg-[#F5FAFE] pb-16">
      {/* Thanh điều khiển cố định trên cùng của phòng làm bài tập */}
      <div className="sticky top-0 z-30 border-b border-[#DCEAF3] bg-white/95 shadow-xs backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          {/* Thông tin bài tập & Nút quay lại (có xác nhận khi đang làm dở) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRequestExit}
              title="Quay về bài học"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] px-3 py-2 text-xs font-extrabold text-[#243B53] transition hover:border-[#2878B8] hover:text-[#2878B8]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Bài học</span>
            </button>

            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2878B8]">
                {STUDY_CATEGORY_LABELS[exercise.category]} • {exercise.level}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-black uppercase text-[#243B53] sm:text-lg">
                  {exercise.title}
                </h1>
                <span className="hidden rounded-md border border-[#DCEAF3] bg-[#F5FAFE] px-2.5 py-0.5 text-xs font-semibold text-[#718096] md:inline">
                  {exercise.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Góc phải: Làm lại + Nộp bài + Đồng hồ + Nút mở Bảng điều hướng câu hỏi thu gọn */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={handleStartNewAttempt}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2878B8] bg-white px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-[#2878B8] transition hover:bg-[#EAF6FD]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Làm lại</span>
            </button>

            {!isSubmitted ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26522] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-xs transition hover:bg-[#d95314]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Nộp bài</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-white">
                <CheckCircle2 className="h-4 w-4" />
                <span>Đã nộp</span>
              </span>
            )}

            {!isSubmitted && (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#75BDEB] bg-[#EAF6FD] px-3.5 py-2 font-mono text-xs font-black text-[#2878B8] sm:text-sm">
                <Clock className="h-4 w-4" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>
            )}

            {/* Nút mở Bảng điều hướng câu hỏi thu gọn trên góc */}
            <button
              type="button"
              onClick={() => setNavDrawerOpen((v) => !v)}
              title="Mở bảng danh sách câu hỏi"
              aria-expanded={navDrawerOpen}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-black transition ${
                navDrawerOpen
                  ? 'border-[#2878B8] bg-[#2878B8] text-white'
                  : 'border-[#75BDEB] bg-[#EAF6FD] text-[#2878B8] hover:bg-[#75BDEB] hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>
                {isSubmitted
                  ? `${activeResult?.correctCount}/${totalQuestions}`
                  : `${answeredCount}/${totalQuestions}`}
              </span>
            </button>
          </div>
        </div>

        {/* Thanh phụ đặt ngay phía trên: Tiêu đề câu hiện tại + Nút CÂU TRƯỚC / CÂU TIẾP (chuyển từng câu 1) */}
        <div className="border-t border-[#EAF6FD] bg-[#F5FAFE] px-4 py-2.5 lg:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wide text-[#243B53] sm:text-sm">
              {exercise.title} • Câu {safeIndex + 1} / {totalQuestions}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEAF3] bg-white px-3.5 py-1.5 text-xs font-extrabold uppercase text-[#243B53] transition hover:bg-[#EAF6FD] disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Câu trước</span>
              </button>

              <button
                type="button"
                disabled={safeIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2878B8] px-4 py-1.5 text-xs font-extrabold uppercase text-white transition hover:bg-[#1f5f94] disabled:opacity-40"
              >
                <span>Câu tiếp</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng điều hướng câu hỏi thu gọn trên góc phải (chỉ bung ra khi nhấn nút) */}
      {navDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[1px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNavDrawerOpen(false)
          }}
        >
          <div className="fixed right-4 top-16 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[#DCEAF3] bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#EAF6FD] pb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#243B53]">
                Danh sách câu hỏi ({answeredCount}/{totalQuestions} đã chọn)
              </span>
              <button
                type="button"
                onClick={() => setNavDrawerOpen(false)}
                className="rounded-lg p-1 text-[#718096] hover:bg-[#EAF6FD] hover:text-[#243B53]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <QuestionNavigator
              questions={questions}
              currentIndex={safeIndex}
              answers={answers}
              result={activeResult}
              onSelectIndex={(idx) => {
                setCurrentIndex(idx)
                setNavDrawerOpen(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Khu vực làm bài chính */}
      <main className="mx-auto max-w-7xl px-4 pt-6 lg:px-6">
        {submitError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
            <CircleAlert className="h-5 w-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {!isSubmitted && attemptHistory.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#A7D8F5] bg-[#EAF6FD] px-4 py-2.5 text-xs text-[#243B53]">
            <span>
              Bạn đang ở lượt làm bài mới. Kết quả lượt gần nhất:{' '}
              <strong>
                {attemptHistory[attemptHistory.length - 1].correctCount}/{totalQuestions} câu đúng (
                {attemptHistory[attemptHistory.length - 1].accuracyPercent}%)
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setViewingAttemptIndex(attemptHistory.length - 1)}
              className="font-extrabold text-[#2878B8] hover:underline"
            >
              Xem lại kết quả lượt trước
            </button>
          </div>
        )}

        {activeResult && (
          <ExerciseResultBanner
            result={activeResult}
            previousResult={previousResult}
            onRetry={handleStartNewAttempt}
            onViewPrevious={
              viewingAttemptIndex !== null && viewingAttemptIndex > 0
                ? () => setViewingAttemptIndex(viewingAttemptIndex - 1)
                : undefined
            }
          />
        )}

        <QuestionRenderer
          question={currentQuestion}
          questionIndex={safeIndex}
          totalQuestions={totalQuestions}
          selectedOptionId={selectedForDisplay}
          submitted={isSubmitted}
          review={currentReview}
          onSelectOption={handleSelectOption}
        />
      </main>

      <SubmissionModal
        open={confirmOpen}
        exerciseTitle={`${exercise.title} – ${exercise.subtitle}`}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        submitting={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      <ExitExamConfirmModal
        open={exitModalOpen || blocker.state === 'blocked'}
        title="Xác nhận thoát bài tập"
        description="Bạn đang làm bài tập trắc nghiệm và chưa nộp bài. Nếu thoát bây giờ, các câu trả lời chưa nộp sẽ không được lưu. Bạn có chắc chắn muốn thoát?"
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        onCancel={handleCancelExit}
        onConfirmExit={handleConfirmExit}
      />
    </div>
  )
}
