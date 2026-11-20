import { formatHms } from '@/features/test-online/hooks/useTestTimer'
import type { TestAttemptResult } from '@/features/test-online/types/test.types'

interface TestResultSummaryProps {
  result: TestAttemptResult
  onRetakeTest: () => void
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TestResultSummary({
  result,
  onRetakeTest,
}: TestResultSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Khối thông tin đầu trang giống hệt ảnh mẫu 1 */}
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
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#243B53] sm:text-3xl">
              {result.testTitle}
            </h1>
          </div>

          <button
            type="button"
            onClick={onRetakeTest}
            className="rounded-lg border border-[#2878B8] bg-white px-5 py-2 text-xs font-bold text-[#2878B8] transition hover:bg-[#EAF6FD] sm:text-sm"
          >
            Làm lại
          </button>
        </div>

        {/* 4 thẻ trắng viền mảnh: ĐIỂM / THỜI GIAN LÀM / BẮT ĐẦU / HOÀN THÀNH */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#718096]">
              ĐIỂM
            </p>
            {result.isFullTestScoreEligible && result.convertedTotalScore !== null ? (
              <p className="mt-2 text-2xl font-black text-[#243B53]">
                {result.convertedTotalScore}/990
              </p>
            ) : (
              <p className="mt-2 text-2xl font-black text-[#243B53]">
                {result.correctCount}/{result.totalQuestions}{' '}
                <span className="text-sm font-bold text-[#2878B8]">
                  ({result.accuracyPercent}%)
                </span>
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#718096]">
              THỜI GIAN LÀM
            </p>
            <p className="mt-2 font-mono text-2xl font-black text-[#243B53]">
              {formatHms(result.actualDurationSeconds)}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#718096]">
              BẮT ĐẦU
            </p>
            <p className="mt-2 text-xl font-black text-[#243B53]">
              {formatDateTime(result.startedAt)}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#718096]">
              HOÀN THÀNH
            </p>
            <p className="mt-2 text-xl font-black text-[#243B53]">
              {formatDateTime(result.submittedAt)}
            </p>
          </div>
        </div>
      </section>

      {/* Số câu đúng theo từng Part giống hệt ảnh mẫu 1 */}
      <section>
        <h2 className="text-lg font-bold text-[#243B53]">Số câu đúng theo từng Part</h2>

        <div className="mt-3.5 flex flex-wrap gap-3.5">
          {result.partStats.map((part) => (
            <div
              key={part.partNumber}
              className="flex min-w-[135px] flex-col items-center justify-center rounded-xl border border-[#DCEAF3] bg-white px-5 py-4 text-center shadow-2xs"
            >
              <span className="text-xs font-semibold text-[#718096]">
                Part {part.partNumber}
              </span>
              <span className="mt-1 text-xl font-black text-[#2878B8]">
                {part.correctCount}/{part.totalQuestions}
              </span>
              <span className="mt-0.5 text-xs text-[#718096]">câu đúng</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
