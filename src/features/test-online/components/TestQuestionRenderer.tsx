import { Bookmark, FileText, HelpCircle } from 'lucide-react'
import ImageViewer from '@/features/study-zone/components/ImageViewer'
import TestAudioPlayer from '@/features/test-online/components/AudioPlayer'
import AnswerOption from '@/features/test-online/components/AnswerOption'
import type {
  AudioGroupState,
  QuestionGroup,
  QuestionReviewDetail,
  TestContentBlock,
  TestPart,
} from '@/features/test-online/types/test.types'

interface TestQuestionRendererProps {
  part: TestPart
  group: QuestionGroup
  activeQuestionId?: string
  /** Khi truyền singleQuestionId (VD: Part 5 câu đơn hoặc Xem kết quả "Theo câu"), chỉ hiển thị đúng 1 câu hỏi đó thay vì cả nhóm */
  singleQuestionId?: string
  answers: Record<string, string>
  flaggedQuestionIds: string[]
  audioGroupState?: AudioGroupState
  mode: 'exam' | 'review'
  reviewsMap?: Record<string, QuestionReviewDetail>
  onSelectAnswer: (questionId: string, optionId: string) => void
  onToggleFlag: (questionId: string) => void
  onAudioPlayStarted?: (audioGroupId: string) => void
  onAudioPlayCompleted?: (audioGroupId: string) => void
}

export default function TestQuestionRenderer({
  part,
  group,
  activeQuestionId,
  singleQuestionId,
  answers,
  flaggedQuestionIds,
  audioGroupState,
  mode,
  reviewsMap,
  onSelectAnswer,
  onToggleFlag,
  onAudioPlayStarted,
  onAudioPlayCompleted,
}: TestQuestionRendererProps) {
  const flaggedSet = new Set(flaggedQuestionIds)
  const audioGroupId = group.audioGroupId ?? group.id
  const hasStimulus = group.stimulus.length > 0

  const visibleQuestions = singleQuestionId
    ? group.questions.filter((q) => q.id === singleQuestionId)
    : group.questions
  const questionsToRender = visibleQuestions.length > 0 ? visibleQuestions : group.questions

  // Lấy transcript chung của nhóm (nếu đang ở chế độ review sau khi nộp bài)
  const firstQuestionWithTranscript =
    mode === 'review' && reviewsMap
      ? group.questions.map((q) => reviewsMap[q.id]).find((r) => Boolean(r?.transcript))
      : undefined

  const renderStimulusBlock = (block: TestContentBlock) => {
    if (block.type === 'audio') {
      return (
        <TestAudioPlayer
          key={block.id}
          audioGroupId={audioGroupId}
          src={block.url}
          title={block.title ?? `${part.title} – Audio`}
          durationSeconds={block.durationSeconds}
          status={audioGroupState?.status ?? 'NOT_PLAYED'}
          mode={mode === 'exam' ? 'exam_strict_once' : 'review'}
          onPlayStarted={onAudioPlayStarted}
          onPlayCompleted={onAudioPlayCompleted}
        />
      )
    }

    if (block.type === 'image') {
      return (
        <ImageViewer
          key={block.id}
          src={block.url}
          alt={block.alt ?? group.groupTitle}
          caption={block.caption}
        />
      )
    }

    if (block.type === 'text') {
      return (
        <div
          key={block.id}
          className={`rounded-xl border border-[#DCEAF3] p-5 text-[15.5px] leading-[1.78] text-[#1E293B] sm:p-6 ${
            block.variant === 'instruction'
              ? 'bg-[#EAF6FD]/70 font-semibold text-[#2878B8]'
              : 'whitespace-pre-line bg-[#F8FAFC] font-normal'
          }`}
        >
          {block.content}
        </div>
      )
    }

    return null
  }

  return (
    <div className="ec-reading-font">
      {group.groupTitle && questionsToRender.length > 1 && (
        <div className="mb-4 text-[15px] font-semibold text-[#1E293B]">
          {group.groupTitle}
        </div>
      )}

      {/* Bố cục 2 cột khi có Stimulus (Hình ảnh Part 1 / Hội thoại Part 3-4 / Đoạn văn Part 6-7) */}
      <div
        className={
          hasStimulus
            ? 'grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,11fr)_minmax(0,10fr)]'
            : 'flex flex-col gap-5'
        }
      >
        {hasStimulus && (
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:max-h-[74vh] lg:overflow-y-auto lg:pr-1">
            {group.stimulus.map(renderStimulusBlock)}

            {/* Hiển thị Audio Transcript & Dịch nghĩa ở chế độ Xem lại bài thi */}
            {mode === 'review' && firstQuestionWithTranscript?.transcript && (
              <div className="rounded-xl border border-[#75BDEB] bg-[#EAF6FD]/60 p-4 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#2878B8]">
                  <FileText className="h-4 w-4" />
                  <span>Audio Transcript & Bản dịch</span>
                </div>
                <p className="mt-2 whitespace-pre-line font-semibold text-[#243B53]">
                  {firstQuestionWithTranscript.transcript}
                </p>
                {firstQuestionWithTranscript.translation && (
                  <p className="mt-2 whitespace-pre-line border-t border-[#DCEAF3] pt-2 text-[#718096]">
                    {firstQuestionWithTranscript.translation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cột danh sách câu hỏi */}
        <div className="flex flex-col gap-6">
          {questionsToRender.map((question) => {
            const selectedOptionId = answers[question.id]
            const isFlagged = flaggedSet.has(question.id)
            const isCurrent = activeQuestionId === question.id
            const review = mode === 'review' ? reviewsMap?.[question.id] : undefined

            return (
              <div
                key={question.id}
                id={`test-question-${question.id}`}
                className={`rounded-xl border p-4 transition sm:p-5 ${
                  isCurrent
                    ? 'border-[#75BDEB] bg-[#F5FAFE]/70'
                    : 'border-[#DCEAF3] bg-white'
                }`}
              >
                {/* Hàng số thứ tự câu hỏi + Nút đánh dấu xem lại */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[16px] font-bold text-[#1E293B]">
                    Câu {question.questionNumber}.
                  </span>

                  {mode === 'exam' && (
                    <button
                      type="button"
                      onClick={() => onToggleFlag(question.id)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        isFlagged
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-[#DCEAF3] bg-white text-[#64748B] hover:border-[#75BDEB] hover:text-[#1E293B]'
                      }`}
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 ${isFlagged ? 'fill-amber-500 text-amber-600' : ''}`}
                      />
                      <span>{isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                    </button>
                  )}
                </div>

                {/* Nội dung riêng của câu hỏi (Text / Image / Audio theo thứ tự Admin cấu hình) */}
                <div className="mt-3 flex flex-col gap-3">
                  {question.content.map((block) => {
                    if (block.type === 'text') {
                      return (
                        <p
                          key={block.id}
                          className="text-[16px] font-semibold leading-[1.68] text-[#1E293B] sm:text-[16.5px]"
                        >
                          {block.content}
                        </p>
                      )
                    }
                    if (block.type === 'image') {
                      return (
                        <ImageViewer
                          key={block.id}
                          src={block.url}
                          alt={block.alt ?? `Câu ${question.questionNumber}`}
                          caption={block.caption}
                        />
                      )
                    }
                    if (block.type === 'audio') {
                      return (
                        <TestAudioPlayer
                          key={block.id}
                          audioGroupId={`${audioGroupId}-${question.id}`}
                          src={block.url}
                          title={block.title}
                          durationSeconds={block.durationSeconds}
                          status={audioGroupState?.status ?? 'NOT_PLAYED'}
                          mode={mode === 'exam' ? 'exam_strict_once' : 'review'}
                          onPlayStarted={onAudioPlayStarted}
                          onPlayCompleted={onAudioPlayCompleted}
                        />
                      )
                    }
                    return null
                  })}
                </div>

                {/* Các phương án trả lời A, B, C, D */}
                <div className="mt-4 flex flex-col gap-2.5">
                  {question.options.map((opt) => {
                    const isOptSelected = selectedOptionId === opt.id
                    const reviewState = review
                      ? {
                          isCorrectOption: review.correctOptionId === opt.id,
                          isUserWrongSelection:
                            review.selectedOptionId === opt.id && !review.isCorrect,
                        }
                      : undefined

                    return (
                      <AnswerOption
                        key={opt.id}
                        option={opt}
                        isSelected={isOptSelected}
                        disabled={mode === 'review'}
                        reviewState={reviewState}
                        onSelect={(optId) => onSelectAnswer(question.id, optId)}
                      />
                    )
                  })}
                </div>

                {/* Khung Giải thích đáp án ở chế độ Xem lại bài thi */}
                {mode === 'review' && review && (
                  <div className="mt-4 rounded-xl border border-[#75BDEB] bg-[#F5FAFE] p-4 text-[14px] leading-[1.7] text-[#1E293B]">
                    <div className="flex items-center gap-1.5 font-bold text-[#2878B8]">
                      <HelpCircle className="h-4 w-4" />
                      <span>Giải thích đáp án chi tiết:</span>
                    </div>
                    <p className="mt-1.5 font-normal text-[#334155]">{review.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
