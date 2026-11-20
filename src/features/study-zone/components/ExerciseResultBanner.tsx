import { CheckCircle2, Clock, History, RotateCcw, Trophy } from 'lucide-react'
import type { ExerciseAttemptResult } from '@/features/study-zone/types'

interface ExerciseResultBannerProps {
  result: ExerciseAttemptResult
  previousResult: ExerciseAttemptResult | null
  onRetry: () => void
  onViewPrevious?: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s} giây`
  return `${m} phút ${String(s).padStart(2, '0')} giây`
}

/**
 * Thẻ tổng kết kết quả trực quan ngay sau khi nộp bài:
 * Hiển thị Tổng số câu, Số câu đúng, Số câu sai, Số câu chưa làm, Điểm thang 10, Tỷ lệ chính xác (Progress Bar), Thời gian hoàn thành và Lượt làm trước.
 */
export default function ExerciseResultBanner({
  result,
  previousResult,
  onRetry,
  onViewPrevious,
}: ExerciseResultBannerProps) {
  return (
    <section className="mb-5 rounded-2xl border-2 border-[#75BDEB] bg-gradient-to-r from-[#EAF6FD] via-white to-[#F5FAFE] p-5 shadow-xs">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2878B8] text-white shadow-sm">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold uppercase text-[#243B53] sm:text-lg">
                KẾT QUẢ BÀI TẬP: {result.scoreTen}/10 ĐIỂM ({result.accuracyPercent}%)
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" /> Đã chấm điểm
              </span>
            </div>
            <p className="mt-1 text-xs text-[#718096]">
              Hệ thống đã mở khóa toàn bộ Đáp án đúng, Audio Script và Giải thích chi tiết cho từng câu bên dưới.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#243B53]">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#2878B8]" />
                Thời gian hoàn thành: <strong>{formatDuration(result.durationSeconds)}</strong>
              </span>

              {previousResult && (
                <button
                  type="button"
                  onClick={onViewPrevious}
                  className="inline-flex items-center gap-1 text-[#2878B8] hover:underline"
                >
                  <History className="h-3.5 w-3.5" />
                  Lượt trước: {previousResult.correctCount}/{previousResult.totalQuestions} câu ({previousResult.accuracyPercent}%)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Thống kê chi tiết + Nút Làm lại */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-xl border border-[#DCEAF3] bg-white px-3.5 py-2 text-center">
            <span className="block text-[11px] font-semibold text-[#718096]">Tổng số</span>
            <span className="text-base font-extrabold text-[#243B53]">{result.totalQuestions} câu</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-center">
            <span className="block text-[11px] font-semibold text-[#718096]">Đúng</span>
            <span className="text-base font-extrabold text-emerald-600">{result.correctCount} câu</span>
          </div>

          <div className="rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-center">
            <span className="block text-[11px] font-semibold text-[#718096]">Sai</span>
            <span className="text-base font-extrabold text-rose-600">
              {result.incorrectCount - result.unansweredCount} câu
            </span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-center">
            <span className="block text-[11px] font-semibold text-[#718096]">Bỏ trống</span>
            <span className="text-base font-extrabold text-amber-600">{result.unansweredCount} câu</span>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26522] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#d95314]"
          >
            <RotateCcw className="h-4 w-4" />
            Làm lại lượt mới
          </button>
        </div>
      </div>

      {/* Thanh Progress Bar tỷ lệ chính xác */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs font-semibold text-[#243B53]">
          <span>Tỷ lệ chính xác</span>
          <span>{result.accuracyPercent}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#DCEAF3]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2878B8] to-emerald-500 transition-all duration-500"
            style={{ width: `${result.accuracyPercent}%` }}
          />
        </div>
      </div>
    </section>
  )
}
