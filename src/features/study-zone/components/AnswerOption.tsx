import { Check, X } from 'lucide-react'
import ImageViewer from '@/features/study-zone/components/ImageViewer'
import AudioPlayer from '@/features/study-zone/components/AudioPlayer'
import type { QuestionOption } from '@/features/study-zone/types'

interface AnswerOptionProps {
  option: QuestionOption
  selected: boolean
  submitted: boolean
  isCorrectOption?: boolean
  onSelect: (optionId: string) => void
}

/**
 * Hiển thị một phương án trả lời A, B, C, D:
 * - Hỗ trợ nội dung linh hoạt: văn bản, hình ảnh hoặc kết hợp văn bản + hình ảnh.
 * - Trước khi nộp bài: làm nổi bật phương án đang chọn, cho phép đổi đáp án, tuyệt đối không tiết lộ đáp án đúng.
 * - Sau khi nộp bài: khóa chọn và hiển thị rõ nhãn "Đáp án đúng ✓" (xanh lá) hoặc "Bạn chọn (Sai)" (đỏ) giống ảnh mẫu.
 */
export default function AnswerOption({
  option,
  selected,
  submitted,
  isCorrectOption = false,
  onSelect,
}: AnswerOptionProps) {
  const isWrongSelection = submitted && selected && !isCorrectOption
  const isRightAnswer = submitted && isCorrectOption

  let containerStyle = 'border-[#DCEAF3] bg-white hover:border-[#75BDEB] hover:bg-[#F5FAFE]'
  if (!submitted && selected) {
    containerStyle = 'border-[#2878B8] bg-[#EAF6FD] ring-2 ring-[#75BDEB]/40'
  } else if (isRightAnswer) {
    containerStyle = 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200'
  } else if (isWrongSelection) {
    containerStyle = 'border-rose-500 bg-rose-50/75'
  }

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={submitted ? -1 : 0}
      onClick={() => {
        if (!submitted) onSelect(option.id)
      }}
      onKeyDown={(e) => {
        if (!submitted && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect(option.id)
        }
      }}
      className={`relative flex flex-col gap-3 rounded-xl border-2 p-4 transition ${
        submitted ? 'cursor-default' : 'cursor-pointer'
      } ${containerStyle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          {/* Nút tròn Radio */}
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              isRightAnswer
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : isWrongSelection
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : selected
                    ? 'border-[#2878B8] bg-[#2878B8] text-white'
                    : 'border-[#718096]/60 bg-white'
            }`}
          >
            {(selected || isRightAnswer) && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>

          {/* Nhãn A / B / C / D */}
          <span className="mt-0.5 w-5 shrink-0 text-[15.5px] font-bold text-[#1E293B]">
            {option.label}.
          </span>

          {/* Nội dung linh hoạt của phương án (chữ / ảnh / audio) */}
          <div className="ec-reading-font min-w-0 flex-1 space-y-2.5">
            {option.content.map((block) => {
              if (block.type === 'text') {
                return (
                  <p key={block.id} className="text-[15.5px] font-medium leading-[1.6] text-[#1E293B]">
                    {block.content}
                  </p>
                )
              }
              if (block.type === 'image') {
                return (
                  <div key={block.id} onClick={(e) => e.stopPropagation()}>
                    <ImageViewer src={block.url} alt={block.alt} caption={block.caption} compact />
                  </div>
                )
              }
              if (block.type === 'audio') {
                return (
                  <div key={block.id} onClick={(e) => e.stopPropagation()}>
                    <AudioPlayer
                      src={block.url}
                      title={block.title}
                      defaultDurationSeconds={block.durationSeconds}
                    />
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>

        {/* Badge kết quả sau khi nộp bài giống ảnh mẫu */}
        {isRightAnswer && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs">
            <Check className="h-3.5 w-3.5" />
            {selected ? 'Bạn chọn (Đúng)' : 'Đáp án đúng'}
          </span>
        )}

        {isWrongSelection && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs">
            <X className="h-3.5 w-3.5" />
            Bạn chọn (Sai)
          </span>
        )}
      </div>
    </div>
  )
}
