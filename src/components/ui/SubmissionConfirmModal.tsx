import { useEffect, useRef } from 'react'
import { CheckCircle2, CircleAlert, ClipboardCheck, LoaderCircle, X } from 'lucide-react'

export type SubmissionConfirmVariant = 'study' | 'exam'

export interface SubmissionConfirmModalProps {
  open: boolean
  variant: SubmissionConfirmVariant
  examName: string
  examType?: string
  totalQuestions: number
  answeredCount: number
  /** Nếu truyền số (VD: Test Online), hiển thị cột thứ 3 "Đánh dấu xem lại". Nếu undefined (Study Zone), chỉ hiển thị 2 cột. */
  markedCount?: number
  submitting: boolean
  errorMessage?: string | null
  onCancel: () => void
  onConfirm: () => void
}

const MODAL_TITLES: Record<SubmissionConfirmVariant, string> = {
  study: 'Xác nhận nộp bài luyện tập',
  exam: 'Xác nhận nộp bài thi',
}

/**
 * Hộp thoại xác nhận nộp bài dùng chung cho Study Zone và Test Online
 * Thiết kế theo concept: MINIMALIST LEARNING CONFIRMATION – ZEN-INSPIRED EDUCATION UI
 */
export default function SubmissionConfirmModal({
  open,
  variant,
  examName,
  examType,
  totalQuestions,
  answeredCount,
  markedCount,
  submitting,
  errorMessage,
  onCancel,
  onConfirm,
}: SubmissionConfirmModalProps) {
  const backButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return

    const prevActive = document.activeElement as HTMLElement | null
    backButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      prevActive?.focus?.()
    }
  }, [open, submitting, onCancel])

  if (!open) return null

  const total = Math.max(0, Math.floor(totalQuestions))
  const answered = Math.min(total, Math.max(0, Math.floor(answeredCount)))
  const unanswered = Math.max(0, total - answered)
  const progressPct = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0

  const hasMarked = typeof markedCount === 'number'
  const safeMarked = hasMarked ? Math.max(0, Math.floor(markedCount)) : 0
  const subtitle = [examType, examName].filter(Boolean).join(' · ')

  const statsColumns: Array<{ label: string; value: number }> = [
    { label: 'Đã trả lời', value: answered },
    { label: 'Chưa trả lời', value: unanswered },
  ]
  if (hasMarked) {
    statsColumns.push({ label: 'Đánh dấu xem lại', value: safeMarked })
  }

  return (
    <div
      className="ec-reading-font fixed inset-0 z-50 flex items-center justify-center bg-[#243B53]/35 p-4 backdrop-blur-[3px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onCancel()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-confirm-title"
        className="max-h-[calc(100vh-32px)] w-full max-w-[600px] overflow-y-auto rounded-[18px] border border-[#DCEAF3] bg-white p-[18px] text-[#243B53] shadow-[0_16px_44px_rgba(36,59,83,0.16)] sm:p-[26px]"
      >
        {/* A. HEADER */}
        <div className="flex items-center gap-3">
          <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] bg-[#EAF6FD] text-[#2878B8]">
            <ClipboardCheck className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="submission-confirm-title"
              className="m-0 text-[20px] font-bold leading-[1.3] text-[#2878B8] sm:text-[21px]"
            >
              {MODAL_TITLES[variant]}
            </h2>
            {subtitle && (
              <p className="mt-0.5 break-words text-[13px] leading-snug text-[#718096]">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            aria-label="Đóng"
            className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] text-[#718096] transition hover:bg-[#EAF6FD] hover:text-[#243B53] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* B. CONTENT – TIẾN ĐỘ BÀI LÀM */}
        <p className="mt-[22px] text-[16.5px] font-semibold leading-[1.4] text-[#243B53] sm:text-[17.5px]">
          Bạn đã hoàn thành bài làm?
        </p>
        <p className="mt-1 text-[14.5px] leading-[1.55] text-[#718096]">
          Kiểm tra lại tình trạng bài trước khi xác nhận nộp.
        </p>

        {/* Progress Summary */}
        <div className="mt-[18px] rounded-[14px] bg-[#F5FAFE] px-[18px] py-4">
          <div className="flex items-baseline justify-between gap-2.5">
            <span className="text-[13px] text-[#718096]">Tiến độ hoàn thành</span>
            <span className="text-[13px] font-semibold text-[#2878B8]">{progressPct}%</span>
          </div>

          <p className="mb-3 mt-0.5 text-[24px] font-bold leading-[1.2] text-[#243B53] sm:text-[25px]">
            {answered}/{total}
            <span className="ml-1.5 text-[14px] font-medium text-[#718096]">câu đã trả lời</span>
          </p>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            aria-label="Tiến độ hoàn thành bài làm"
            className="h-2 overflow-hidden rounded-full bg-[#D9E7F1]"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#75BDEB] to-[#2878B8] transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div
            className={`mt-4 grid ${
              statsColumns.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {statsColumns.map((col, idx) => (
              <div
                key={col.label}
                className={
                  idx === 0
                    ? 'pr-2.5 sm:pr-3.5'
                    : 'border-l border-[#DCEAF3] px-2.5 sm:px-3.5'
                }
              >
                <div className="text-[12.5px] text-[#718096]">{col.label}</div>
                <div className="mt-0.5 text-[16px] font-bold text-[#243B53] sm:text-[17px]">
                  {col.value}
                  <small className="ml-1 text-[12.5px] font-medium text-[#718096]">câu</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C. WARNING / STATUS MESSAGE */}
        {unanswered > 0 ? (
          <div className="mt-3.5 flex items-start gap-[9px] rounded-[10px] border border-[#F3E2A0] bg-[#FFF9E6] px-[13px] py-2.5 text-[13.5px] leading-[1.5] text-[#7A5200]">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#D98B1F]" />
            <span>
              Bạn vẫn còn <strong className="font-semibold">{unanswered} câu</strong> chưa trả lời.
              Những câu bỏ trống sẽ không được tính điểm.
            </span>
          </div>
        ) : total > 0 ? (
          <div className="mt-3.5 flex items-start gap-[9px] rounded-[10px] border border-[#CFE8CF] bg-[#EEF8EE] px-[13px] py-2.5 text-[13.5px] leading-[1.5] text-[#2F6B2F]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6B2F]" />
            <span>
              Bạn đã hoàn thành tất cả câu hỏi. Có thể kiểm tra lại trước khi nộp bài.
            </span>
          </div>
        ) : null}

        {errorMessage && (
          <p
            role="alert"
            className="mt-2.5 rounded-[10px] border border-[#F3C9C9] bg-[#FDF0F0] px-3 py-2.5 text-[13px] text-[#9B2C2C]"
          >
            {errorMessage}
          </p>
        )}

        {/* D. FOOTER – ACTION BUTTONS */}
        <div className="mt-[22px] flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
          <button
            ref={backButtonRef}
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#DCEAF3] bg-white px-5 py-3.5 text-[14px] font-semibold leading-none text-[#2878B8] transition hover:border-[#A7D8F5] hover:bg-[#EAF6FD] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#A7D8F5] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-3"
          >
            Quay lại làm bài
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[#2878B8] px-5 py-3.5 text-[14px] font-semibold leading-none text-white shadow-[0_2px_6px_rgba(40,120,184,0.22)] transition hover:bg-[#216aa3] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#A7D8F5] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-3"
          >
            {submitting && <LoaderCircle className="h-[15px] w-[15px] animate-spin" />}
            <span>{submitting ? 'Đang nộp bài...' : 'Nộp bài'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
