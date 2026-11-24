import { centerInfo } from '@/config/center-info'
import { formatHms } from '@/features/test-online/hooks/useTestTimer'
import type { TestAttemptResult } from '@/features/test-online/types/test.types'

interface TestResultSummaryProps {
  result: TestAttemptResult
  onRetakeTest: () => void
}

function formatDateTimeVi(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export default function TestResultSummary({
  result,
  onRetakeTest,
}: TestResultSummaryProps) {
  return (
    <div className="ec-reading-font flex flex-col gap-6">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold ${
                result.status === 'submitted'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {result.status === 'submitted' ? 'Hoàn thành' : 'Hết giờ'}
            </span>
            <h1 className="mt-2 text-2xl font-normal tracking-tight text-[#111827] sm:text-3xl">
              {result.testTitle}
            </h1>
            <div className="mt-1 select-none">
              <span className="text-base font-black uppercase tracking-tight text-[#75BDEB]">
                <span className="text-[#F26522]">E</span>NGLISH CENTER
              </span>
              <span className="block -mt-1 text-[9px] font-bold uppercase tracking-wider text-[#2878B8]">
                {centerInfo.slogan}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRetakeTest}
            className="rounded-md border border-[#75BDEB] bg-white px-5 py-2 text-xs font-semibold text-[#2878B8] transition hover:bg-[#EAF6FD] sm:text-sm"
          >
            Làm lại
          </button>
        </div>

        {/* 4 thẻ thống kê đồng bộ cùng 1 font số tabular-nums sắc nét */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              ĐIỂM
            </p>
            {result.isFullTestScoreEligible && result.convertedTotalScore !== null ? (
              <div>
                <p className="mt-2 text-[22px] font-bold leading-tight tabular-nums tracking-tight text-[#111827] sm:text-2xl">
                  {result.convertedTotalScore}
                  <span className="ml-0.5 text-lg font-normal text-[#64748B]">/990</span>
                </p>
                <p className="mt-1.5 text-[11px] font-medium tabular-nums text-[#64748B]">
                  LC {result.convertedListeningScore ?? 0}/495 • RC{' '}
                  {result.convertedReadingScore ?? 0}/495 • Đúng {result.correctCount} • Sai{' '}
                  {result.incorrectCount} • Trống {result.unansweredCount}
                </p>
              </div>
            ) : (
              <div>
                <p className="mt-2 text-[22px] font-bold leading-tight tabular-nums tracking-tight text-[#111827] sm:text-2xl">
                  {result.correctCount}/{result.totalQuestions}{' '}
                  <span className="text-sm font-semibold text-[#2878B8]">
                    ({result.accuracyPercent}%)
                  </span>
                </p>
                <p className="mt-1.5 text-[11px] font-medium tabular-nums text-[#64748B]">
                  Đúng {result.correctCount} • Sai {result.incorrectCount} • Trống{' '}
                  {result.unansweredCount}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              THỜI GIAN LÀM
            </p>
            <p className="mt-2 text-[22px] font-bold leading-tight tabular-nums tracking-tight text-[#111827] sm:text-2xl">
              {formatHms(result.actualDurationSeconds)}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              BẮT ĐẦU
            </p>
            <p className="mt-2 text-[22px] font-bold leading-tight tabular-nums tracking-tight text-[#111827] sm:text-2xl">
              {formatDateTimeVi(result.startedAt)}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              HOÀN THÀNH
            </p>
            <p className="mt-2 text-[22px] font-bold leading-tight tabular-nums tracking-tight text-[#111827] sm:text-2xl">
              {formatDateTimeVi(result.submittedAt)}
            </p>
          </div>
        </div>
      </section>

      {/* Số câu đúng theo từng Part */}
      <section>
        <h2 className="text-lg font-bold text-[#111827]">Số câu đúng theo từng Part</h2>

        <div className="mt-3.5 grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-7">
          {result.partStats.map((part) => (
            <div
              key={part.partNumber}
              className="flex flex-col items-center justify-center rounded-xl border border-[#DCEAF3] bg-white px-4 py-4 text-center shadow-2xs"
            >
              <span className="text-xs font-medium text-[#64748B]">
                Part {part.partNumber}
              </span>
              <span className="mt-1 text-[22px] font-bold tabular-nums tracking-tight text-[#75BDEB]">
                {part.correctCount}/{part.totalQuestions}
              </span>
              <span className="mt-0.5 text-xs text-[#64748B]">câu đúng</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
