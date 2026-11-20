import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Calendar,
  Clock,
  Flag,
} from 'lucide-react'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useTestHistory } from '@/features/test-online/hooks/useTestHistory'
import { useTests } from '@/features/test-online/hooks/useTests'
import { formatHms } from '@/features/test-online/hooks/useTestTimer'
import type { AttemptStatus } from '@/features/test-online/types/test.types'

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—'
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

export default function TestHistoryPage() {
  const { data: testsList } = useTests()

  // Bộ lọc đang chỉnh trên thanh công cụ
  const [selectedTestSlug, setSelectedTestSlug] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AttemptStatus>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Bộ lọc đã nhấn "LỌC" hoặc khi bấm "Xem tất cả ->" trên 1 thẻ bài thi
  const [appliedFilters, setAppliedFilters] = useState<{
    testSlug: string
    status: 'all' | AttemptStatus
    fromDate: string
    toDate: string
  }>({
    testSlug: '',
    status: 'all',
    fromDate: '',
    toDate: '',
  })

  const { data, loading, error, retry } = useTestHistory({
    testSlug: appliedFilters.testSlug || undefined,
    status: appliedFilters.status,
    fromDate: appliedFilters.fromDate || undefined,
    toDate: appliedFilters.toDate || undefined,
    sortOrder: 'newest',
  })

  const records = useMemo(() => data ?? [], [data])

  // Nhóm các lượt làm bài theo từng Đề thi để hiển thị ở màn hình tổng quan (giống ảnh mẫu 3)
  const groupedByTest = useMemo(() => {
    const map = new Map<
      string,
      {
        testSlug: string
        testTitle: string
        totalAttempts: number
        latestRecord: (typeof records)[number]
      }
    >()

    for (const item of records) {
      const slug = item.attempt.testSlug
      const existing = map.get(slug)
      if (!existing) {
        map.set(slug, {
          testSlug: slug,
          testTitle: item.attempt.testTitle,
          totalAttempts: 1,
          latestRecord: item,
        })
      } else {
        existing.totalAttempts += 1
      }
    }

    return Array.from(map.values())
  }, [records])

  const handleApplyFilter = () => {
    setAppliedFilters({
      testSlug: selectedTestSlug,
      status: statusFilter,
      fromDate,
      toDate,
    })
  }

  const handleResetFilters = () => {
    setSelectedTestSlug('')
    setStatusFilter('all')
    setFromDate('')
    setToDate('')
    setAppliedFilters({
      testSlug: '',
      status: 'all',
      fromDate: '',
      toDate: '',
    })
  }

  const handleDrillDownTest = (testSlug: string) => {
    setSelectedTestSlug(testSlug)
    setAppliedFilters((prev) => ({
      ...prev,
      testSlug,
    }))
  }

  const handleBackToGroupedView = () => {
    setSelectedTestSlug('')
    setAppliedFilters((prev) => ({
      ...prev,
      testSlug: '',
    }))
  }

  const isSingleTestView = Boolean(appliedFilters.testSlug)

  return (
    <div className="ec-reading-font min-h-screen bg-[#F5FAFE] pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 lg:px-6">
        {/* Tiêu đề trang giống ảnh mẫu 3 */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#243B53] sm:text-3xl">
            Lịch sử làm bài
          </h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            Xem lại các lần thi Listening & Reading của bạn.
          </p>
        </div>

        {/* Thanh bộ lọc: Bài thi | Trạng thái | Từ ngày | Đến ngày | LỌC | Đặt lại giống ảnh 2 & 3 */}
        <section className="mt-5 rounded-2xl border border-[#DCEAF3] bg-white p-5 shadow-2xs">
          <div className="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_180px_160px_160px_auto]">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#243B53]">
                Bài thi
              </label>
              <select
                value={selectedTestSlug}
                onChange={(e) => setSelectedTestSlug(e.target.value)}
                className="w-full rounded-lg border border-[#DCEAF3] bg-white px-3 py-2.5 text-xs font-medium text-[#243B53] outline-none focus:border-[#2878B8]"
              >
                <option value="">Tất cả bài thi</option>
                {(testsList ?? []).map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#243B53]">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | AttemptStatus)}
                className="w-full rounded-lg border border-[#DCEAF3] bg-white px-3 py-2.5 text-xs font-medium text-[#243B53] outline-none focus:border-[#2878B8]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="submitted">Hoàn thành</option>
                <option value="in_progress">Đang làm</option>
                <option value="expired">Hết giờ</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#243B53]">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-[#DCEAF3] bg-white px-3 py-2 text-xs font-medium text-[#243B53] outline-none focus:border-[#2878B8]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#243B53]">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-[#DCEAF3] bg-white px-3 py-2 text-xs font-medium text-[#243B53] outline-none focus:border-[#2878B8]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleApplyFilter}
                className="rounded-lg bg-[#2878B8] px-5 py-2.5 text-xs font-extrabold uppercase text-white shadow-2xs transition hover:bg-[#1e639c]"
              >
                LỌC
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#4A5568] hover:text-[#2878B8] hover:underline"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </section>

        {/* Nội dung danh sách lịch sử */}
        <div className="mt-6">
          {loading && <LoadingBlock label="Đang tải lịch sử làm bài..." />}

          {!loading && error && <ErrorBlock message={error} onRetry={retry} />}

          {!loading && !error && records.length === 0 && (
            <EmptyBlock
              title="Chưa có lượt thi nào phù hợp"
              description="Hãy thử đặt lại bộ lọc hoặc bắt đầu một đề thi mới."
            />
          )}

          {/* Chế độ 1: Tổng quan theo từng Bài thi giống ảnh mẫu 3 */}
          {!loading && !error && records.length > 0 && !isSingleTestView && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {groupedByTest.map(({ testSlug, testTitle, totalAttempts, latestRecord }) => {
                const { attempt, result } = latestRecord
                const isInProgress = attempt.status === 'in_progress'
                const detailLink = isInProgress
                  ? `/test-online/attempt/${attempt.id}`
                  : `/test-history/${attempt.id}`

                return (
                  <article
                    key={testSlug}
                    className="flex flex-col justify-between rounded-2xl border border-[#DCEAF3] bg-white p-5 shadow-2xs transition hover:border-[#75BDEB] hover:shadow-md"
                  >
                    <div>
                      <h2 className="text-base font-bold text-[#243B53]">{testTitle}</h2>
                      <p className="mt-0.5 text-xs text-[#718096]">{totalAttempts} lượt làm</p>

                      {/* Khung xám nhạt bên trong hiển thị lượt gần nhất giống ảnh 3 */}
                      <Link
                        to={detailLink}
                        className="mt-4 block rounded-xl bg-[#F5FAFE] p-4 transition hover:bg-[#EAF6FD]/70"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                              isInProgress
                                ? 'bg-amber-100 text-amber-800'
                                : attempt.status === 'submitted'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isInProgress
                              ? 'Đang làm'
                              : attempt.status === 'submitted'
                                ? 'Hoàn thành'
                                : 'Hết giờ'}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-[#718096]" />
                        </div>

                        <div className="mt-3 flex items-baseline justify-between gap-2">
                          {result ? (
                            result.isFullTestScoreEligible &&
                            result.convertedTotalScore !== null ? (
                              <span className="text-2xl font-black text-[#243B53]">
                                {result.convertedTotalScore}
                                <span className="text-xs font-semibold text-[#718096]">/990</span>
                              </span>
                            ) : (
                              <span className="text-xl font-black text-[#243B53]">
                                {result.correctCount}/{result.totalQuestions}
                              </span>
                            )
                          ) : (
                            <span className="text-2xl font-black text-[#243B53]">—</span>
                          )}

                          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#4A5568]">
                            <Clock className="h-3.5 w-3.5 text-[#718096]" />
                            {result ? formatHms(result.actualDurationSeconds) : '00:00:00'}
                          </span>
                        </div>

                        <p className="mt-2 text-[11px] text-[#718096]">
                          {formatDateTime(attempt.submittedAt ?? attempt.startedAt)}
                        </p>
                      </Link>
                    </div>

                    {/* Hàng chân thẻ: Xem tất cả -> | Tiếp tục / Làm lại giống ảnh 3 */}
                    <div className="mt-4 flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleDrillDownTest(testSlug)}
                        className="text-xs font-extrabold text-[#2878B8] hover:underline"
                      >
                        Xem tất cả →
                      </button>

                      {isInProgress ? (
                        <Link
                          to={`/test-online/attempt/${attempt.id}`}
                          className="rounded-lg bg-[#2878B8] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#1e639c]"
                        >
                          Tiếp tục
                        </Link>
                      ) : (
                        <Link
                          to={`/test-online/${testSlug}`}
                          className="rounded-lg border border-[#DCEAF3] bg-white px-4 py-2 text-xs font-bold text-[#243B53] transition hover:border-[#75BDEB] hover:bg-[#F5FAFE]"
                        >
                          Làm lại
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Chế độ 2: Xem tất cả các lượt làm của một đề thi giống ảnh mẫu 2 */}
          {!loading && !error && records.length > 0 && isSingleTestView && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleBackToGroupedView}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2878B8] hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Xem lịch sử theo bài thi</span>
                </button>

                <span className="text-xs font-semibold text-[#718096]">
                  {records.length} lượt phù hợp
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {records.map(({ attempt, result }) => {
                  const isInProgress = attempt.status === 'in_progress'

                  return (
                    <article
                      key={attempt.id}
                      className="flex flex-col justify-between rounded-2xl border border-[#DCEAF3] bg-white p-5 shadow-2xs"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-[#243B53]">{attempt.testTitle}</h3>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-extrabold ${
                            attempt.status === 'submitted'
                              ? 'bg-emerald-100 text-emerald-700'
                              : attempt.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {attempt.status === 'submitted'
                            ? 'Hoàn thành'
                            : attempt.status === 'in_progress'
                              ? 'Đang làm'
                              : 'Hết giờ'}
                        </span>

                        {/* Khung điểm số LC / RC giống ảnh 2 */}
                        <div className="mt-4 rounded-xl bg-[#F5FAFE] p-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A5568]">
                              <Award className="h-4 w-4 text-[#2878B8]" />
                              <span>Điểm</span>
                            </span>

                            {result ? (
                              result.isFullTestScoreEligible &&
                              result.convertedTotalScore !== null ? (
                                <span className="text-2xl font-black text-[#243B53]">
                                  {result.convertedTotalScore}
                                  <span className="text-xs font-semibold text-[#718096]">
                                    /990
                                  </span>
                                </span>
                              ) : (
                                <span className="text-xl font-black text-[#243B53]">
                                  {result.correctCount}/{result.totalQuestions}
                                </span>
                              )
                            ) : (
                              <span className="text-xl font-black text-[#243B53]">—</span>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-[#DCEAF3] pt-2.5 text-xs font-bold text-[#243B53]">
                            <span>
                              <span className="font-normal text-[#718096]">LC </span>
                              {result
                                ? result.convertedListeningScore !== null
                                  ? `${result.convertedListeningScore}/495`
                                  : `${result.listeningCorrect}/${result.listeningTotal}`
                                : '—'}
                            </span>
                            <span>
                              <span className="font-normal text-[#718096]">RC </span>
                              {result
                                ? result.convertedReadingScore !== null
                                  ? `${result.convertedReadingScore}/495`
                                  : `${result.readingCorrect}/${result.readingTotal}`
                                : '—'}
                            </span>
                          </div>
                        </div>

                        {/* THỜI GIAN LÀM / BẮT ĐẦU / KẾT THÚC */}
                        <div className="mt-4 flex flex-col gap-2 text-xs">
                          <div className="flex items-center justify-between text-[#718096]">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              THỜI GIAN LÀM
                            </span>
                            <strong className="font-mono text-[#243B53]">
                              {result ? formatHms(result.actualDurationSeconds) : '00:00:00'}
                            </strong>
                          </div>

                          <div className="flex items-center justify-between text-[#718096]">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              BẮT ĐẦU
                            </span>
                            <strong className="text-[#243B53]">
                              {formatDateTime(attempt.startedAt)}
                            </strong>
                          </div>

                          <div className="flex items-center justify-between text-[#718096]">
                            <span className="inline-flex items-center gap-1.5">
                              <Flag className="h-3.5 w-3.5" />
                              KẾT THÚC
                            </span>
                            <strong className="text-[#243B53]">
                              {formatDateTime(attempt.submittedAt)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* 2 nút: Xem chi tiết (xanh) & Làm lại (cam) giống ảnh 2 */}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link
                          to={
                            isInProgress
                              ? `/test-online/attempt/${attempt.id}`
                              : `/test-history/${attempt.id}`
                          }
                          className="inline-flex items-center justify-center rounded-xl bg-[#2878B8] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#1e639c]"
                        >
                          {isInProgress ? 'Tiếp tục' : 'Xem chi tiết'}
                        </Link>

                        <Link
                          to={`/test-online/${attempt.testSlug}`}
                          className="inline-flex items-center justify-center rounded-xl bg-[#F26522] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#d95314]"
                        >
                          Làm lại
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
