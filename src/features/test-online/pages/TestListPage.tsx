import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, LayoutGrid, ListOrdered, Sparkles } from 'lucide-react'
import PageBanner from '@/components/ui/PageBanner'
import FilterBar from '@/components/ui/FilterBar'
import Pagination from '@/components/ui/Pagination'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useTests } from '@/features/test-online/hooks/useTests'
import { TestCard, TestCollectionTimeline } from '@/features/test-online/components/TestCard'
import { matchText, paginate } from '@/utils/format'

const PAGE_SIZE = 6

export default function TestListPage() {
  const { data, loading, error, retry } = useTests()
  const [keyword, setKeyword] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('Mới nhất')
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('timeline')
  const [page, setPage] = useState(1)

  const tests = useMemo(() => data ?? [], [data])

  const difficulties = useMemo(
    () => Array.from(new Set(tests.map((t) => t.difficulty))),
    [tests],
  )
  const testTypes = useMemo(() => Array.from(new Set(tests.map((t) => t.testType))), [tests])

  const filteredTests = useMemo(() => {
    const matched = tests.filter((t) => {
      if (difficultyFilter && t.difficulty !== difficultyFilter) return false
      if (typeFilter && t.testType !== typeFilter) return false
      return matchText(`${t.title} ${t.code} ${t.description} ${t.collectionGroup}`, keyword)
    })

    return [...matched].sort((a, b) => {
      if (sortOrder === 'Nhiều lượt thi nhất') {
        return b.attemptsCount - a.attemptsCount
      }
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return sortOrder === 'Cũ nhất' ? -diff : diff
    })
  }, [tests, difficultyFilter, typeFilter, keyword, sortOrder])

  const paged = useMemo(() => paginate(filteredTests, page, PAGE_SIZE), [filteredTests, page])

  return (
    <div className="ec-reading-font min-h-screen bg-[#F5FAFE] pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-[#DCEAF3] bg-white py-2 text-xs text-[#718096]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#2878B8] hover:underline">
              Trang chủ
            </Link>
            <span>»</span>
            <span className="font-bold text-[#243B53]">Test Online</span>
          </div>

          <Link
            to="/test-history"
            className="inline-flex items-center gap-1.5 font-extrabold text-[#2878B8] hover:underline"
          >
            <History className="h-3.5 w-3.5" />
            <span>Lịch sử làm bài của tôi</span>
          </Link>
        </div>
      </div>

      {/* Banner đầu trang */}
      <PageBanner
        title="TEST ONLINE – LUYỆN THI TOEIC TRỰC TUYẾN"
        badge="HMC TOEIC Testing Platform"
        subtitle="Luyện tập thường xuyên, đánh giá trình độ và chinh phục mục tiêu TOEIC."
        image="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400"
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-6">
        {/* Thanh chuyển nhanh & Lịch sử bài thi */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCEAF3] bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26522] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Listening & Reading (7 Parts)
            </span>
            <span className="rounded-lg bg-[#EAF6FD] px-3.5 py-2 text-xs font-bold text-[#2878B8]">
              Hỗ trợ: Thi toàn bộ đề (Full Test) & Tự chọn Part (Part 1 – Part 7)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/test-history"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#75BDEB] bg-[#F5FAFE] px-4 py-2 text-xs font-extrabold text-[#2878B8] transition hover:bg-[#75BDEB] hover:text-white"
            >
              <History className="h-4 w-4" />
              <span>Xem lịch sử & Kết quả các lần thi</span>
            </Link>

            <div className="inline-flex rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  viewMode === 'cards'
                    ? 'bg-[#2878B8] text-white'
                    : 'text-[#718096] hover:text-[#243B53]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Thẻ đề thi</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  viewMode === 'timeline'
                    ? 'bg-[#2878B8] text-white'
                    : 'text-[#718096] hover:text-[#243B53]'
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Theo bộ đề</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bộ lọc tìm kiếm, độ khó, loại đề, sắp xếp */}
        <FilterBar
          keyword={keyword}
          onKeywordChange={(v) => {
            setKeyword(v)
            setPage(1)
          }}
          placeholder="Tìm theo tên đề thi, mã đề (VD: TEST 1 – 2026, ETS-2026-T01)..."
          selects={[
            {
              id: 'test-difficulty',
              value: difficultyFilter,
              placeholder: 'Tất cả độ khó',
              options: difficulties,
              onChange: (v) => {
                setDifficultyFilter(v)
                setPage(1)
              },
            },
            {
              id: 'test-type',
              value: typeFilter,
              placeholder: 'Tất cả loại đề',
              options: testTypes,
              onChange: (v) => {
                setTypeFilter(v)
                setPage(1)
              },
            },
            {
              id: 'test-sort',
              value: sortOrder,
              placeholder: 'Sắp xếp: Mới nhất',
              options: ['Mới nhất', 'Cũ nhất', 'Nhiều lượt thi nhất'],
              onChange: (v) => {
                setSortOrder(v || 'Mới nhất')
                setPage(1)
              },
            },
          ]}
        />

        {/* Danh sách đề thi */}
        <div className="mt-7">
          {loading && <LoadingBlock label="Đang tải danh sách đề thi trực tuyến..." />}

          {!loading && error && <ErrorBlock message={error} onRetry={retry} />}

          {!loading && !error && filteredTests.length === 0 && (
            <EmptyBlock
              title="Không tìm thấy đề thi phù hợp"
              description="Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc độ khó / loại đề."
            />
          )}

          {!loading && !error && filteredTests.length > 0 && (
            <>
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paged.items.map((test) => (
                    <TestCard key={test.id} test={test} />
                  ))}
                </div>
              ) : (
                <TestCollectionTimeline tests={filteredTests} />
              )}

              {viewMode === 'cards' && (
                <div className="mt-8">
                  <Pagination
                    page={paged.page}
                    totalPages={paged.totalPages}
                    onChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
