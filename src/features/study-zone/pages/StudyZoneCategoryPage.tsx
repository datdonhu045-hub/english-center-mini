import { useMemo } from 'react'
import PageBanner from '@/components/ui/PageBanner'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useStudyTopics } from '@/features/study-zone/hooks/useStudyZone'
import StudyZoneTabs from '@/features/study-zone/components/StudyZoneTabs'
import StudyTimelineAccordion from '@/features/study-zone/components/StudyTimelineAccordion'
import { STUDY_CATEGORY_LABELS, type StudyZoneCategory } from '@/features/study-zone/types'

interface StudyZoneCategoryPageProps {
  category: StudyZoneCategory
}

const CATEGORY_META: Record<StudyZoneCategory, { subtitle: string }> = {
  grammar: {
    subtitle:
      'Hệ thống lộ trình ngữ pháp TOEIC trọng tâm từ nền tảng 350+ đến chuyên sâu 800+, kèm bài tập thực hành trắc nghiệm tương tác.',
  },
  vocabulary: {
    subtitle:
      'Kho từ vựng TOEIC Listening, Reading, Speaking & Writing theo từng Episode có phiên âm IPA, âm thanh phát âm, hình ảnh minh họa và bài TEST.',
  },
  listening: {
    subtitle:
      'Luyện nghe TOEIC Part 1–4 chuẩn format đề thi thật với trình phát Audio chuyên dụng, Transcript song ngữ và bài tập chấm điểm tức thì.',
  },
}

export default function StudyZoneCategoryPage({ category }: StudyZoneCategoryPageProps) {
  const { data, loading, error, retry } = useStudyTopics(category)
  const topics = useMemo(() => data ?? [], [data])

  const meta = CATEGORY_META[category]
  const categoryLabel = STUDY_CATEGORY_LABELS[category]

  return (
    <div className="ec-font min-h-screen bg-white pb-16">
      {/* Banner đầu trang STUDY ZONE */}
      <PageBanner
        title="STUDY ZONE"
        badge={`Chuyên mục: ${categoryLabel}`}
        subtitle={meta.subtitle}
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400"
      />

      <div className="mx-auto max-w-6xl px-4 pt-8 lg:px-6">
        {/* Thanh 3 Tab chuyển đổi: Ngữ pháp | Từ vựng | Luyện nghe */}
        <StudyZoneTabs activeCategory={category} />

        {/* Danh sách Lộ trình & Bài TEST theo mẫu giao diện */}
        <div className="mt-7">
          {loading && (
            <LoadingBlock label={`Đang tải danh sách ${categoryLabel.toLowerCase()}...`} />
          )}

          {!loading && error && <ErrorBlock message={error} onRetry={retry} />}

          {!loading && !error && topics.length === 0 && (
            <EmptyBlock
              title={`Chưa có nội dung ${categoryLabel.toLowerCase()}`}
              description="Nội dung chuyên mục đang được cập nhật."
            />
          )}

          {!loading && !error && topics.length > 0 && (
            <StudyTimelineAccordion key={category} topics={topics} defaultOpenIndex={0} />
          )}
        </div>
      </div>
    </div>
  )
}
