import { CircleAlert, LoaderCircle } from 'lucide-react'

interface SubmissionModalProps {
  open: boolean
  exerciseTitle: string
  totalQuestions: number
  answeredCount: number
  submitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function SubmissionModal({
  open,
  exerciseTitle,
  totalQuestions,
  answeredCount,
  submitting,
  onCancel,
  onConfirm,
}: SubmissionModalProps) {
  if (!open) return null

  const unansweredCount = Math.max(0, totalQuestions - answeredCount)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel()
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#DCEAF3] bg-white shadow-2xl">
        <div className="bg-[#2878B8] px-6 py-4 text-white">
          <h2 id="submit-confirm-title" className="text-base font-extrabold uppercase tracking-wide">
            Xác nhận nộp bài – {exerciseTitle}
          </h2>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <span className="block text-xs font-semibold text-emerald-700">Đã trả lời</span>
              <span className="mt-1 block text-2xl font-black text-emerald-700">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <span className="block text-xs font-semibold text-amber-800">Chưa trả lời</span>
              <span className="mt-1 block text-2xl font-black text-amber-700">
                {unansweredCount} câu
              </span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Bạn còn <strong>{unansweredCount} câu chưa chọn đáp án</strong>. Các câu bỏ trống sẽ được tính là chưa đúng khi chấm điểm.
              </span>
            </div>
          )}

          <p className="text-xs text-[#718096]">
            Sau khi xác nhận nộp bài, hệ thống sẽ khóa chỉnh sửa đáp án, chấm điểm tự động và hiển thị toàn bộ lời giải chi tiết.
          </p>

          <div className="flex flex-col-reverse justify-end gap-2.5 border-t border-[#DCEAF3] pt-4 sm:flex-row">
            <button
              type="button"
              disabled={submitting}
              onClick={onCancel}
              className="rounded-lg border border-[#DCEAF3] bg-white px-4 py-2.5 text-xs font-bold uppercase text-[#243B53] transition hover:bg-[#F5FAFE] disabled:opacity-50"
            >
              Quay lại làm bài
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26522] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-xs transition hover:bg-[#d95314] disabled:opacity-60"
            >
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {submitting ? 'Đang chấm bài...' : 'Xác nhận nộp bài'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
