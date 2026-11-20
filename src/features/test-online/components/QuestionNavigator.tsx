import { useState } from 'react'
import { Bookmark, Lock } from 'lucide-react'
import type {
  AudioGroupState,
  QuestionReviewDetail,
  TestPart,
  ToeicPartNumber,
} from '@/features/test-online/types/test.types'

interface QuestionNavigatorProps {
  activeParts: TestPart[]
  currentPartNumber: ToeicPartNumber
  activeQuestionId?: string
  answers: Record<string, string>
  flaggedQuestionIds: string[]
  audioStates?: Record<string, AudioGroupState>
  listeningCompleted: boolean
  mode: 'exam' | 'review'
  reviewsMap?: Record<string, QuestionReviewDetail>
  onJumpToQuestion: (
    partNumber: ToeicPartNumber,
    groupId: string,
    questionId: string,
  ) => void
}

type NavFilter = 'all' | 'unanswered' | 'flagged'

export default function QuestionNavigator({
  activeParts,
  currentPartNumber,
  activeQuestionId,
  answers,
  flaggedQuestionIds,
  audioStates = {},
  listeningCompleted,
  mode,
  reviewsMap,
  onJumpToQuestion,
}: QuestionNavigatorProps) {
  const [filter, setFilter] = useState<NavFilter>('all')
  const flaggedSet = new Set(flaggedQuestionIds)

  return (
    <aside className="rounded-2xl border border-[#DCEAF3] bg-white p-4 shadow-xl sm:p-5">
      <div className="flex items-center justify-between border-b border-[#EAF6FD] pb-3 pr-7">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#243B53]">
          Bảng điều hướng câu hỏi
        </h3>
        {flaggedSet.size > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
            <Bookmark className="h-3 w-3 fill-amber-500" />
            {flaggedSet.size}
          </span>
        )}
      </div>

      {/* Bộ lọc nhanh: Tất cả / Chưa làm / Đánh dấu */}
      {mode === 'exam' && (
        <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl bg-[#F5FAFE] p-1 text-[11px] font-extrabold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg py-1.5 transition ${
              filter === 'all' ? 'bg-[#2878B8] text-white' : 'text-[#718096] hover:text-[#243B53]'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilter('unanswered')}
            className={`rounded-lg py-1.5 transition ${
              filter === 'unanswered'
                ? 'bg-[#2878B8] text-white'
                : 'text-[#718096] hover:text-[#243B53]'
            }`}
          >
            Chưa làm
          </button>
          <button
            type="button"
            onClick={() => setFilter('flagged')}
            className={`rounded-lg py-1.5 transition ${
              filter === 'flagged'
                ? 'bg-[#2878B8] text-white'
                : 'text-[#718096] hover:text-[#243B53]'
            }`}
          >
            Đánh dấu
          </button>
        </div>
      )}

      {/* Danh sách số câu hỏi theo từng Part */}
      <div className="mt-4 flex max-h-[58vh] flex-col gap-4 overflow-y-auto pr-1">
        {activeParts.map((part) => {
          const isReadingLocked =
            mode === 'exam' && part.section === 'reading' && !listeningCompleted
          const isPartActive = part.partNumber === currentPartNumber

          const partQuestions = part.questionGroups.flatMap((g) =>
            g.questions.map((q) => ({ question: q, group: g })),
          )

          const visibleItems = partQuestions.filter(({ question }) => {
            if (filter === 'unanswered') return !answers[question.id]
            if (filter === 'flagged') return flaggedSet.has(question.id)
            return true
          })

          return (
            <div key={part.id} className="border-b border-[#EAF6FD] pb-3.5 last:border-b-0">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span
                  className={`font-extrabold ${
                    isPartActive ? 'text-[#2878B8]' : 'text-[#243B53]'
                  }`}
                >
                  {part.title} – {part.englishTitle}
                </span>

                {isReadingLocked && (
                  <span
                    title="Hoàn thành toàn bộ phần Listening để mở khóa Reading"
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#718096]"
                  >
                    <Lock className="h-3 w-3" />
                    Khóa
                  </span>
                )}
              </div>

              {visibleItems.length === 0 ? (
                <p className="text-[11px] italic text-[#718096]">Không có câu hỏi theo bộ lọc.</p>
              ) : (
                <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
                  {visibleItems.map(({ question, group }) => {
                    const isCurrent = activeQuestionId === question.id
                    const isAnswered = Boolean(answers[question.id])
                    const isFlagged = flaggedSet.has(question.id)
                    const review = mode === 'review' ? reviewsMap?.[question.id] : undefined

                    // Trong khi đang thi Listening (chưa hoàn thành Listening), chỉ cho bấm vào nhóm đã phát hoặc đang phát
                    const audioKey = group.audioGroupId ?? group.id
                    const groupAudioStatus = audioStates[audioKey]?.status
                    const isFutureUnplayedListening =
                      mode === 'exam' &&
                      !listeningCompleted &&
                      part.section === 'listening' &&
                      groupAudioStatus === 'NOT_PLAYED' &&
                      !isCurrent

                    const isDisabled = isReadingLocked || isFutureUnplayedListening

                    let btnClass =
                      'border-[#DCEAF3] bg-[#F5FAFE] text-[#243B53] hover:border-[#75BDEB]'
                    if (review) {
                      if (review.isCorrect) {
                        btnClass = 'border-emerald-500 bg-emerald-500 text-white'
                      } else if (review.selectedOptionId) {
                        btnClass = 'border-rose-500 bg-rose-500 text-white'
                      } else {
                        btnClass = 'border-amber-400 bg-amber-50 text-amber-800'
                      }
                    } else if (isCurrent) {
                      btnClass = 'border-[#F26522] bg-[#F26522] text-white ring-2 ring-[#F26522]/30'
                    } else if (isAnswered) {
                      btnClass = 'border-[#2878B8] bg-[#2878B8] text-white'
                    }

                    return (
                      <button
                        key={question.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() =>
                          onJumpToQuestion(part.partNumber, group.id, question.id)
                        }
                        className={`relative flex h-8 items-center justify-center rounded-lg border text-xs font-extrabold transition ${btnClass} ${
                          isDisabled ? 'cursor-not-allowed opacity-40' : ''
                        }`}
                      >
                        <span>{question.questionNumber}</span>
                        {isFlagged && (
                          <span
                            aria-label="Đã đánh dấu"
                            className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-amber-500"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Chú thích màu sắc */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#EAF6FD] pt-3 text-[11px] font-semibold text-[#718096]">
        {mode === 'exam' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-[#F26522]" />
              <span>Đang xem</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-[#2878B8]" />
              <span>Đã trả lời</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-[#DCEAF3] bg-[#F5FAFE]" />
              <span>Chưa trả lời</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span>Đánh dấu xem lại</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span>Trả lời đúng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-500" />
              <span>Trả lời sai</span>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
