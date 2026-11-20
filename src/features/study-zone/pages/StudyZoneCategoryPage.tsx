import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, ListOrdered } from 'lucide-react'
import PageBanner from '@/components/ui/PageBanner'
import FilterBar from '@/components/ui/FilterBar'
import Pagination from '@/components/ui/Pagination'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useStudyTopics } from '@/features/study-zone/hooks/useStudyZone'
import StudyZoneTabs from '@/features/study-zone/components/StudyZoneTabs'
import StudyTimelineAccordion from '@/features/study-zone/components/StudyTimelineAccordion'
import StudyTopicCard from '@/features/study-zone/components/StudyTopicCard'
import { STUDY_CATEGORY_LABELS, type StudyZoneCategory } from '@/features/study-zone/types'
import { matchText, paginate } from '@/utils/format'

interface StudyZoneCategoryPageProps {
  category: StudyZoneCategory
}

const PAGE_SIZE = 6

const CATEGORY_META: Record<
  StudyZoneCategory,
  { subtitle: string; searchPlaceholder: string }
> = {
  grammar: {
    subtitle:
      'Hệ thống lộ trình ngữ pháp TOEIC trọng tâm từ nền tảng 350+ đến chuyên sâu 800+, kèm bài tập thực hành trắc nghiệm tương tác.',
    searchPlaceholder: 'Tìm kiếm chuyên đề ngữ pháp (VD: Mệnh đề quan hệ, Thì động từ...)',
  },
  vocabulary: {
    subtitle:
      'Kho từ vựng TOEIC Listening, Reading, Speaking & Writing theo từng Episode có phiên âm IPA, âm thanh phát âm, hình ảnh minh họa và bài TEST.',
    searchPlaceholder: 'Tìm chủ đề từ vựng (VD: Vocab Ep 5, Hợp đồng, Nhân sự...)',
  },
  listening: {
    subtitle:
      'Luyện nghe TOEIC Part 1–4 chuẩn format đề thi thật với trình phát Audio chuyên dụng, Transcript song ngữ và bài tập chấm điểm tức thì.',
    searchPlaceholder: 'Tìm bài luyện nghe (VD: Camp Bomb Listening, Part 1, Part 2...)',
  },
}

export default function StudyZoneCategoryPage({ category }: StudyZoneCategoryPageProps) {
  const { data, loading, error, retry } = useStudyTopics(category)
  const [keyword, setKeyword] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [viewMode, setViewMode] = useState<'timeline' | 'cards'>('timeline')
  const [page, setPage] = useState(1)

  const topics = useMemo(() => data ?? [], [data])

  const levelOptions = useMemo(
    () => Array.from(new Set(topics.map((t) => t.level))),
    [topics],
  )

  const filteredTopics = useMemo(
    () =>
      topics.filter(
        (topic) =>
          (!levelFilter || topic.level === levelFilter) &&
          matchText(`${topic.title} ${topic.shortDescription}`, keyword),
      ),
    [topics, levelFilter, keyword],
  )

  const pagedTopics = useMemo(
    () => paginate(filteredTopics, page, PAGE_SIZE),
    [filteredTopics, page],
  )

  const meta = CATEGORY_META[category]
  const categoryLabel = STUDY_CATEGORY_LABELS[category]

  return (
    <div className="ec-font min-h-screen bg-[#F5FAFE] pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-[#DCEAF3] bg-white py-2 text-xs text-[#718096]">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 lg:px-6">
          <Link to="/" className="hover:text-[#2878B8] hover:underline">
            Trang chủ
          </Link>
          <span>»</span>
          <span>Study Zone</span>
          <span>»</span>
          <span className="font-bold text-[#243B53]">{categoryLabel}</span>
        </div>
      </div>

      {/* Banner đầu trang STUDY ZONE */}
      <PageBanner
        title="STUDY ZONE"
        badge={`Chuyên mục: ${categoryLabel}`}
        subtitle={meta.subtitle}
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400"
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-6">
        {/* Thanh 3 Tab chuyển đổi: Ngữ pháp | Từ vựng | Luyện nghe */}
        <StudyZoneTabs activeCategory={category} />

        {/* Thanh tìm kiếm, lọc cấp độ & nút chuyển chế độ hiển thị (Lộ trình Timeline / Thẻ chuyên đề) */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <FilterBar
              keyword={keyword}
              onKeywordChange={(v) => {
                setKeyword(v)
                setPage(1)
              }}
              placeholder={meta.searchPlaceholder}
              selects={
                levelOptions.length > 0
                  ? [
                      {
                        id: 'study-level',
                        value: levelFilter,
                        placeholder: 'Tất cả cấp độ',
                        options: levelOptions,
                        onChange: (v) => {
                          setLevelFilter(v)
                          setPage(1)
                        },
                      },
                    ]
                  : []
              }
            />
          </div>

          <div className="inline-flex shrink-0 self-end rounded-xl border border-[#DCEAF3] bg-white p-1 shadow-xs lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                viewMode === 'timeline'
                  ? 'bg-[#2878B8] text-white shadow-xs'
                  : 'text-[#718096] hover:bg-[#EAF6FD] hover:text-[#243B53]'
              }`}
            >
              <ListOrdered className="h-4 w-4" />
              <span>Lộ trình & Bài TEST</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                viewMode === 'cards'
                  ? 'bg-[#2878B8] text-white shadow-xs'
                  : 'text-[#718096] hover:bg-[#EAF6FD] hover:text-[#243B53]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Thẻ chuyên đề</span>
            </button>
          </div>
        </div>

        {/* Khu vực hiển thị nội dung chính */}
        <div className="mt-7">
          {loading && <LoadingBlock label={`Đang tải danh sách ${categoryLabel.toLowerCase()}...`} />}

          {!loading && error && <ErrorBlock message={error} onRetry={retry} />}

          {!loading && !error && filteredTopics.length === 0 && (
            <EmptyBlock
              title={`Chưa có nội dung ${categoryLabel.toLowerCase()} phù hợp`}
              description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc cấp độ."
            />
          )}

          {!loading && !error && filteredTopics.length > 0 && (
            <>
              {viewMode === 'timeline' ? (
                <StudyTimelineAccordion topics={pagedTopics.items} defaultOpenIndex={0} />
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pagedTopics.items.map((topic) => (
                    <StudyTopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              )}

              <div className="mt-8">
                <Pagination
                  page={pagedTopics.page}
                  totalPages={pagedTopics.totalPages}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
