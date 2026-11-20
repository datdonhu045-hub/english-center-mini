import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronDown, ChevronUp, FileCheck2 } from 'lucide-react'
import { STUDY_CATEGORY_PATHS, type StudyTopic } from '@/features/study-zone/types'

interface StudyTimelineAccordionProps {
  topics: StudyTopic[]
  defaultOpenIndex?: number
}

export default function StudyTimelineAccordion({
  topics,
  defaultOpenIndex = 0,
}: StudyTimelineAccordionProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    if (topics[defaultOpenIndex]) {
      initial[topics[defaultOpenIndex].id] = true
    }
    return initial
  })

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="relative flex flex-col gap-5">
      {topics.map((topic, index) => {
        const isOpen = Boolean(openIds[topic.id])
        const isLast = index === topics.length - 1
        const topicDetailUrl = `${STUDY_CATEGORY_PATHS[topic.category]}/${topic.slug}`

        return (
          <div
            key={topic.id}
            className="relative rounded-xl border border-[#DCEAF3] bg-white px-4 py-4 shadow-sm transition hover:border-[#75BDEB] sm:px-7 sm:py-5"
          >
            {/* Đường kẻ dọc nối các nút số thứ tự giống ảnh chụp giao diện */}
            {!isLast && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-24px] left-[33px] top-11 z-10 w-[3px] bg-[#75BDEB] sm:left-[45px]"
              />
            )}

            {/* Hàng tiêu đề có thể bấm để mở rộng / thu gọn */}
            <button
              type="button"
              onClick={() => toggleItem(topic.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3.5 sm:gap-5">
                <span className="relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2878B8] text-sm font-extrabold text-white shadow-sm ring-4 ring-[#EAF6FD]">
                  {topic.orderNumber || index + 1}
                </span>

                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-[#243B53] sm:text-lg">
                    {topic.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#718096]">
                    {topic.level}
                    {topic.lessonsCount ? ` • ${topic.lessonsCount} bài học` : ''}
                    {topic.wordsCount ? ` • ${topic.wordsCount} từ vựng` : ''}
                    {topic.durationLabel ? ` • Thời lượng ${topic.durationLabel}` : ''}
                    {` • ${topic.exercises.length} bài TEST`}
                  </p>
                </div>
              </div>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#243B53] transition hover:bg-[#EAF6FD]">
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </span>
            </button>

            {/* Nội dung mở rộng: Danh sách các nút TEST 1, TEST 2, TEST 3... + Nút vào xem bài học chi tiết */}
            {isOpen && (
              <div className="mt-4 border-t border-[#EAF6FD] pl-12 pt-4 sm:pl-14">
                <div className="flex flex-wrap items-center gap-3.5">
                  {topic.exercises.map((exercise) => (
                    <Link
                      key={exercise.id}
                      to={`/study-zone/practice/${exercise.id}`}
                      className="group flex min-w-[160px] flex-col rounded-lg border border-[#75BDEB] bg-white px-5 py-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-[#2878B8] hover:bg-[#F5FAFE] sm:min-w-[200px]"
                    >
                      <span className="flex items-center justify-between gap-2 text-sm font-bold uppercase tracking-wide text-[#243B53] group-hover:text-[#2878B8]">
                        <span>{exercise.title}</span>
                        <FileCheck2 className="h-4 w-4 text-[#75BDEB] group-hover:text-[#2878B8]" />
                      </span>
                      <span className="mt-0.5 text-[11px] font-medium text-[#718096]">
                        {exercise.subtitle} • {exercise.questionCount} câu
                      </span>
                    </Link>
                  ))}

                  <Link
                    to={topicDetailUrl}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#DCEAF3] bg-[#EAF6FD] px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-[#2878B8] transition hover:bg-[#A7D8F5]/50"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {topic.category === 'grammar' && 'Xem lý thuyết & Công thức'}
                      {topic.category === 'vocabulary' && 'Học Flashcard Từ vựng'}
                      {topic.category === 'listening' && 'Nghe Audio & Transcript'}
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
