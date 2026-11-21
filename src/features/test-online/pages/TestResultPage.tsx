import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, History, LayoutGrid, X } from 'lucide-react'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useTestAttemptResult } from '@/features/test-online/hooks/useTestAttempt'
import TestResultSummary from '@/features/test-online/components/TestResultSummary'
import TestQuestionRenderer from '@/features/test-online/components/TestQuestionRenderer'
import QuestionNavigator from '@/features/test-online/components/QuestionNavigator'
import type {
  QuestionGroup,
  TestPart,
  TestQuestion,
  ToeicPartNumber,
} from '@/features/test-online/types/test.types'

interface SingleQuestionCursor {
  part: TestPart
  group: QuestionGroup
  question: TestQuestion
}

export default function TestResultPage() {
  const { attemptId = '' } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { data, loading, error, retry } = useTestAttemptResult(attemptId)

  const [viewStyle, setViewStyle] = useState<'list' | 'single'>('single')
  const [activeQuestionCursor, setActiveQuestionCursor] = useState(0)
  const [navDrawerOpen, setNavDrawerOpen] = useState(false)

  const result = data?.result ?? null
  const test = data?.test ?? null
  const attempt = data?.attempt ?? null

  const activeParts = useMemo(() => {
    if (!test || !result) return []
    const set = new Set(result.selectedParts)
    return test.parts
      .filter((p) => set.has(p.partNumber))
      .sort((a, b) => a.partNumber - b.partNumber)
  }, [test, result])

  const flatGroups = useMemo(() => {
    return activeParts.flatMap((part) =>
      part.questionGroups.map((group) => ({ part, group })),
    )
  }, [activeParts])

  // Danh sách phẳng từng câu hỏi 1 (phục vụ chế độ xem "Theo câu": chuyển từng câu 1)
  const flatSingleQuestions = useMemo<SingleQuestionCursor[]>(() => {
    return activeParts.flatMap((part) =>
      part.questionGroups.flatMap((group) =>
        group.questions.map((question) => ({ part, group, question })),
      ),
    )
  }, [activeParts])

  const currentQuestionItem =
    flatSingleQuestions[activeQuestionCursor] ?? flatSingleQuestions[0]

  // Tự động cuộn lên đầu trang khi chuyển câu ở chế độ xem "Theo câu"
  useEffect(() => {
    if (viewStyle === 'single') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [activeQuestionCursor, viewStyle])

  const handleJumpToQuestion = (
    _partNumber: ToeicPartNumber,
    _groupId: string,
    questionId: string,
  ) => {
    setNavDrawerOpen(false)
    const idx = flatSingleQuestions.findIndex((item) => item.question.id === questionId)
    if (idx >= 0) {
      setActiveQuestionCursor(idx)
    }
    window.setTimeout(() => {
      const el = document.getElementById(`test-question-${questionId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 60)
  }

  return (
    <div className="ec-reading-font min-h-screen bg-[#F5FAFE] pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-[#DCEAF3] bg-white py-2 text-xs text-[#718096]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link to="/" className="hover:text-[#2878B8] hover:underline">
              Trang chủ
            </Link>
            <span>»</span>
            <Link to="/test-online" className="hover:text-[#2878B8] hover:underline">
              Test Online
            </Link>
            <span>»</span>
            <span className="font-bold text-[#243B53]">Kết quả bài thi</span>
          </div>

          <Link
            to="/test-history"
            className="inline-flex items-center gap-1.5 font-extrabold text-[#2878B8] hover:underline"
          >
            <History className="h-3.5 w-3.5" />
            <span>Lịch sử làm bài</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-7 lg:px-6">
        {loading && <LoadingBlock label="Đang tải kết quả chấm điểm..." />}

        {!loading && error && <ErrorBlock message={error} onRetry={retry} />}

        {!loading && !error && (!result || !test) && (
          <EmptyBlock
            title="Không tìm thấy kết quả bài thi"
            description="Lượt thi này chưa được nộp hoặc mã lượt thi không tồn tại."
          />
        )}

        {!loading && !error && result && test && (
          <div className="flex flex-col gap-6">
            <TestResultSummary
              result={result}
              onRetakeTest={() => navigate(`/test-online/${result.testSlug}`)}
            />

            {/* Thanh chọn Kiểu xem: Danh sách | Theo câu giống hệt ảnh mẫu 1 */}
            <div>
              <div className="inline-flex items-center gap-1 rounded-xl border border-[#DCEAF3] bg-[#EFF4F8] p-1 text-xs font-bold">
                <span className="px-3 py-1.5 text-[#718096]">Kiểu xem</span>
                <button
                  type="button"
                  onClick={() => setViewStyle('list')}
                  className={`rounded-lg px-4 py-1.5 transition ${
                    viewStyle === 'list'
                      ? 'bg-white font-extrabold text-[#2878B8] shadow-2xs'
                      : 'text-[#243B53] hover:text-[#2878B8]'
                  }`}
                >
                  Danh sách
                </button>
                <button
                  type="button"
                  onClick={() => setViewStyle('single')}
                  className={`rounded-lg px-4 py-1.5 transition ${
                    viewStyle === 'single'
                      ? 'bg-white font-extrabold text-[#2878B8] shadow-2xs'
                      : 'text-[#243B53] hover:text-[#2878B8]'
                  }`}
                >
                  Theo câu
                </button>
              </div>
            </div>

            {/* Khung câu hỏi + Thanh Câu 101 | <- CÂU TRƯỚC | CÂU TIẾP -> đặt ngay phía trên và chuyển từng câu 1 */}
            {viewStyle === 'single' && currentQuestionItem ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCEAF3] bg-white px-5 py-3.5 shadow-2xs">
                  <span className="text-base font-black text-[#243B53]">
                    Câu {currentQuestionItem.question.questionNumber}
                  </span>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={activeQuestionCursor <= 0}
                      onClick={() => setActiveQuestionCursor((i) => Math.max(0, i - 1))}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEAF3] bg-white px-4 py-2 text-xs font-extrabold uppercase text-[#718096] transition hover:border-[#75BDEB] hover:text-[#243B53] disabled:opacity-40"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>CÂU TRƯỚC</span>
                    </button>

                    <button
                      type="button"
                      disabled={activeQuestionCursor >= flatSingleQuestions.length - 1}
                      onClick={() =>
                        setActiveQuestionCursor((i) =>
                          Math.min(flatSingleQuestions.length - 1, i + 1),
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2878B8] px-4 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-[#1e639c] disabled:opacity-40"
                    >
                      <span>CÂU TIẾP</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs sm:p-6">
                  <TestQuestionRenderer
                    part={currentQuestionItem.part}
                    group={currentQuestionItem.group}
                    activeQuestionId={currentQuestionItem.question.id}
                    singleQuestionId={currentQuestionItem.question.id}
                    answers={attempt?.answers ?? {}}
                    flaggedQuestionIds={attempt?.flaggedQuestionIds ?? []}
                    mode="review"
                    reviewsMap={result.reviews}
                    onSelectAnswer={() => {}}
                    onToggleFlag={() => {}}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {flatGroups.map(({ part, group }) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs sm:p-6"
                  >
                    <TestQuestionRenderer
                      part={part}
                      group={group}
                      answers={attempt?.answers ?? {}}
                      flaggedQuestionIds={attempt?.flaggedQuestionIds ?? []}
                      mode="review"
                      reviewsMap={result.reviews}
                      onSelectAnswer={() => {}}
                      onToggleFlag={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Nút nổi "DANH SÁCH CÂU (N)" ở góc phải: bấm vào mới mở bảng điều hướng câu hỏi */}
            <button
              type="button"
              onClick={() => setNavDrawerOpen((v) => !v)}
              className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#2878B8] px-5 py-3 text-xs font-black uppercase tracking-wide text-white shadow-xl transition hover:bg-[#1e639c]"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>DANH SÁCH CÂU</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                {result.totalQuestions}
              </span>
            </button>

            {navDrawerOpen && (
              <div
                className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[1px]"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setNavDrawerOpen(false)
                }}
              >
                <div className="fixed bottom-20 right-6 z-50 w-[calc(100vw-2rem)] max-w-sm">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setNavDrawerOpen(false)}
                      aria-label="Đóng bảng câu hỏi"
                      className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5FAFE] text-[#718096] transition hover:bg-[#EAF6FD] hover:text-[#243B53]"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <QuestionNavigator
                      activeParts={activeParts}
                      currentPartNumber={
                        currentQuestionItem?.part.partNumber ?? activeParts[0]?.partNumber ?? 1
                      }
                      activeQuestionId={currentQuestionItem?.question.id}
                      answers={attempt?.answers ?? {}}
                      flaggedQuestionIds={attempt?.flaggedQuestionIds ?? []}
                      listeningCompleted
                      mode="review"
                      reviewsMap={result.reviews}
                      onJumpToQuestion={handleJumpToQuestion}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
