import { Clock, Sparkles } from 'lucide-react'

interface DurationSelectorProps {
  defaultDuration: number
  availableOptions: number[]
  suggestedDuration: number
  selectedDuration: number
  onSelectDuration: (minutes: number) => void
}

export default function DurationSelector({
  defaultDuration,
  availableOptions,
  suggestedDuration,
  selectedDuration,
  onSelectDuration,
}: DurationSelectorProps) {
  return (
    <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-xs sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAF6FD] pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#2878B8]" />
          <h2 className="text-lg font-extrabold uppercase text-[#243B53] sm:text-xl">
            2. THỜI GIAN LÀM BÀI
          </h2>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6FD] px-3 py-1 text-xs font-extrabold text-[#2878B8]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Thời gian gợi ý cho các Part đã chọn: ~{suggestedDuration} phút</span>
        </span>
      </div>

      <p className="mt-3 text-xs text-[#718096] sm:text-sm">
        Lựa chọn thời gian giới hạn trước khi bắt đầu. Lưu ý: Bạn không thể thay đổi thời gian sau khi đã nhấn Bắt đầu làm bài.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {availableOptions.map((minutes) => {
          const isSelected = selectedDuration === minutes
          const isDefault = minutes === defaultDuration
          const isSuggested = minutes === suggestedDuration

          return (
            <button
              key={minutes}
              type="button"
              onClick={() => onSelectDuration(minutes)}
              className={`flex flex-col items-center justify-center rounded-xl border px-3 py-3.5 text-center transition ${
                isSelected
                  ? 'border-[#2878B8] bg-[#2878B8] text-white shadow-sm'
                  : 'border-[#DCEAF3] bg-[#F5FAFE] text-[#243B53] hover:border-[#75BDEB] hover:bg-[#EAF6FD]'
              }`}
            >
              <span className="text-base font-black">{minutes} phút</span>
              <span
                className={`mt-0.5 text-[11px] font-bold ${
                  isSelected ? 'text-[#EAF6FD]' : 'text-[#718096]'
                }`}
              >
                {isDefault
                  ? 'Mặc định đề'
                  : isSuggested
                    ? 'Khuyên dùng'
                    : `${Math.round((minutes / 60) * 10) / 10} giờ`}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
