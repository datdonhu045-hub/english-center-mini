import { CheckCircle2, XCircle } from 'lucide-react'
import ImageViewer from '@/features/study-zone/components/ImageViewer'
import type { TestOption } from '@/features/test-online/types/test.types'

interface AnswerOptionProps {
  option: TestOption
  isSelected: boolean
  disabled?: boolean
  reviewState?: {
    isCorrectOption: boolean
    isUserWrongSelection: boolean
  }
  onSelect: (optionId: string) => void
}

export default function AnswerOption({
  option,
  isSelected,
  disabled = false,
  reviewState,
  onSelect,
}: AnswerOptionProps) {
  let containerClass =
    'border-transparent bg-transparent text-[#243B53] hover:bg-[#F5FAFE]'
  let radioCircleClass = 'border-[#CBD5E0] bg-white'

  if (reviewState) {
    if (reviewState.isCorrectOption) {
      containerClass = 'border-emerald-500 bg-emerald-50/70 text-[#243B53]'
      radioCircleClass = 'border-emerald-600 bg-emerald-600'
    } else if (reviewState.isUserWrongSelection) {
      containerClass = 'border-rose-500 bg-rose-50/70 text-[#243B53]'
      radioCircleClass = 'border-rose-600 bg-rose-600'
    }
  } else if (isSelected) {
    containerClass = 'border-[#75BDEB] bg-[#EAF6FD]/70 text-[#243B53]'
    radioCircleClass = 'border-[#2878B8] bg-[#2878B8]'
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option.id)}
      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition ${containerClass} ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      {/* Nút tròn Radio giống ảnh mẫu 5 */}
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${radioCircleClass}`}
      >
        {(isSelected || reviewState?.isCorrectOption || reviewState?.isUserWrongSelection) && (
          <span className="h-2 w-2 rounded-full bg-white" />
        )}
      </span>

      <div className="ec-reading-font flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-2 text-[15.5px] leading-[1.6] text-[#1E293B]">
          <span className="font-semibold text-[#243B53]">{option.label}.</span>
          {option.content.map((block) => {
            if (block.type === 'text') {
              const cleaned =
                block.content === `(${option.label})` ||
                block.content === `(${option.label}) Mark your answer`
                  ? ''
                  : block.content
              return cleaned ? (
                <span key={block.id} className="font-normal leading-[1.6]">
                  {cleaned}
                </span>
              ) : null
            }
            if (block.type === 'image') {
              return (
                <div key={block.id} className="mt-1 w-full">
                  <ImageViewer
                    src={block.url}
                    alt={block.alt ?? `Phương án ${option.label}`}
                    compact
                  />
                </div>
              )
            }
            return null
          })}
        </div>

        {reviewState && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
            {reviewState.isCorrectOption && (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đáp án đúng</span>
              </span>
            )}
            {reviewState.isUserWrongSelection && (
              <span className="inline-flex items-center gap-1 text-rose-700">
                <XCircle className="h-3.5 w-3.5" />
                <span>Bạn đã chọn (Sai)</span>
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
