import { useEffect } from 'react'

interface TestSubmitModalProps {
  open: boolean
  examName?: string
  examType?: string
  totalQuestions: number
  answeredCount: number
  flaggedCount?: number
  submitting: boolean
  errorMessage?: string | null
  onCancel: () => void
  onConfirmSubmit: () => void
}

/**
 * Hộp thoại HOÀN THÀNH BÀI KIỂM TRA gọn gàng theo ảnh mẫu 6,
 * sử dụng đúng tông màu xanh dương nhạt (#75BDEB) của English Center.
 */
export default function TestSubmitModal({
  open,
  totalQuestions,
  answeredCount,
  submitting,
  errorMessage,
  onCancel,
  onConfirmSubmit,
}: TestSubmitModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, submitting, onCancel])

  if (!open) return null

  return (
    <div
      className="ec-reading-font fixed inset-0 z-50 flex items-start justify-center bg-slate-900/35 px-4 pt-16 sm:pt-24"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onCancel()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-submit-modal-title"
        className="w-full max-w-[640px] overflow-hidden rounded-lg border border-[#DCEAF3] bg-white shadow-2xl"
      >
        {/* Thanh tiêu đề trên cùng màu xanh dương nhạt */}
        <div className="bg-[#75BDEB] px-5 py-4 text-white">
          <h2
            id="exam-submit-modal-title"
            className="text-lg font-medium uppercase tracking-wide text-white ec-shadow-text sm:text-xl"
          >
            HOÀN THÀNH BÀI KIỂM TRA
          </h2>
        </div>

        {/* Nội dung thông báo */}
        <div className="border-b border-[#DCEAF3] px-5 py-5 text-base text-[#111827]">
          <p>
            Bạn đã hoàn thành {answeredCount}/{totalQuestions} câu hỏi.{' '}
            {answeredCount < totalQuestions
              ? 'Hoàn thành tất cả trước khi gửi bài.'
              : 'Bạn đã sẵn sàng gửi bài kiểm tra.'}
          </p>

          {errorMessage && (
            <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Cụm nút hành động bên phải: GỬI BÀI NGAY | ĐÓNG */}
        <div className="flex items-center justify-end gap-3 px-5 py-4">
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirmSubmit}
            className="rounded-md bg-[#75BDEB] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-2xs transition hover:bg-[#5aaee3] disabled:opacity-60"
          >
            {submitting ? 'ĐANG GỬI...' : 'GỬI BÀI NGAY'}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="rounded-md bg-[#E05252] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-2xs transition hover:bg-[#c93f3f] disabled:opacity-60"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  )
}
