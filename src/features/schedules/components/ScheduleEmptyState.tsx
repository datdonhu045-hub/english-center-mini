import { CalendarX2 } from 'lucide-react'

interface ScheduleEmptyStateProps {
  branchLabel?: string
  month: number
  onResetToDefault?: () => void
}

export default function ScheduleEmptyState({ branchLabel, month, onResetToDefault }: ScheduleEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#DCEAF3] bg-[#F8FAFC] px-4 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF6FD] text-[#2878B8]">
        <CalendarX2 className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-bold text-[#222222]">
        Hiện chưa có lịch khai giảng cho cơ sở và tháng bạn đã chọn.
      </p>
      <p className="mt-1.5 max-w-md text-sm text-[#777777]">
        {branchLabel
          ? `Chưa có lớp công khai tại ${branchLabel} trong tháng ${month}. Bạn vui lòng chọn tháng hoặc cơ sở khác để tra cứu nhé.`
          : 'Bạn vui lòng chọn tháng hoặc cơ sở khác để xem các lớp đang mở tuyển sinh.'}
      </p>
      {onResetToDefault && (
        <button
          type="button"
          onClick={onResetToDefault}
          className="mt-5 rounded-lg bg-[#2878B8] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#1f5f94]"
        >
          Xem lịch tháng 1
        </button>
      )}
    </div>
  )
}
