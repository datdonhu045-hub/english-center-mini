import { AlertTriangle, Bookmark, CheckCircle2, HelpCircle, X } from 'lucide-react'

interface TestSubmitModalProps {
  open: boolean
  totalQuestions: number
  answeredCount: number
  flaggedCount: number
  submitting: boolean
  onCancel: () => void
  onConfirmSubmit: () => void
}

export default function TestSubmitModal({
  open,
  totalQuestions,
  answeredCount,
  flaggedCount,
  submitting,
  onCancel,
  onConfirmSubmit,
}: TestSubmitModalProps) {
  if (!open) return null

  const unansweredCount = Math.max(0, totalQuestions - answeredCount)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xác nhận nộp bài thi"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#DCEAF3] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#EAF6FD] bg-[#F5FAFE] px-6 py-4">
          <h3 className="text-base font-black uppercase text-[#243B53]">
            Xác nhận nộp bài thi
          </h3>
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="rounded-lg p-1 text-[#718096] hover:bg-[#EAF6FD] hover:text-[#243B53]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-[#243B53]">
            Bạn có chắc chắn muốn kết thúc lượt thi và nộp bài ngay bây giờ? Sau khi xác nhận nộp bài, bạn sẽ không thể chỉnh sửa đáp án.
          </p>

          {/* Thống kê 4 chỉ số theo yêu cầu */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#718096]">
                <HelpCircle className="h-3.5 w-3.5 text-[#2878B8]" />
                <span>Tổng số câu</span>
              </div>
              <p className="mt-1 text-lg font-black text-[#243B53]">{totalQuestions} câu</p>
            </div>

            <div className="rounded-xl border border-[#DCEAF3] bg-[#EAF6FD]/70 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2878B8]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đã trả lời</span>
              </div>
              <p className="mt-1 text-lg font-black text-[#2878B8]">{answeredCount} câu</p>
            </div>

            <div className="rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#718096]">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>Chưa trả lời</span>
              </div>
              <p className="mt-1 text-lg font-black text-[#243B53]">{unansweredCount} câu</p>
            </div>

            <div className="rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#718096]">
                <Bookmark className="h-3.5 w-3.5 text-amber-600" />
                <span>Đánh dấu xem lại</span>
              </div>
              <p className="mt-1 text-lg font-black text-[#243B53]">{flaggedCount} câu</p>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
              Lưu ý: Bạn vẫn còn <strong>{unansweredCount} câu chưa trả lời</strong>. Các câu bỏ trống sẽ không được tính điểm.
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onCancel}
              className="rounded-xl border border-[#DCEAF3] bg-white px-4 py-2.5 text-xs font-extrabold text-[#243B53] transition hover:bg-[#F5FAFE]"
            >
              Quay lại làm bài
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={onConfirmSubmit}
              className="rounded-xl bg-[#F26522] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-[#d95314] disabled:opacity-50"
            >
              {submitting ? 'Đang chấm điểm...' : 'Xác nhận nộp bài'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
