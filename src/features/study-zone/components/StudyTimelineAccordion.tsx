import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { STUDY_CATEGORY_PATHS, type StudyTopic } from '@/features/study-zone/types'

interface StudyTimelineAccordionProps {
  topics: StudyTopic[]
  defaultOpenIndex?: number
}

export default function StudyTimelineAccordion({
  topics,
  defaultOpenIndex = 0,
}: StudyTimelineAccordionProps) {
  const [openTopicIds, setOpenTopicIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    if (topics[defaultOpenIndex]) {
      initial[topics[defaultOpenIndex].id] = true
    }
    return initial
  })

  const [openSubTopicIds, setOpenSubTopicIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    const firstTopic = topics[defaultOpenIndex]
    if (firstTopic?.subTopics?.[0]) {
      initial[firstTopic.subTopics[0].id] = true
    }
    return initial
  })

  const toggleTopic = (id: string) => {
    setOpenTopicIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleSubTopic = (id: string) => {
    setOpenSubTopicIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="relative flex flex-col gap-5">
      {topics.map((topic, index) => {
        const isOpen = Boolean(openTopicIds[topic.id])
        const isLast = index === topics.length - 1
        const topicDetailUrl = `${STUDY_CATEGORY_PATHS[topic.category]}/${topic.slug}`
        const hasSubTopics = Boolean(topic.subTopics && topic.subTopics.length > 0)

        return (
          <div
            key={topic.id}
            className="relative rounded-xl border border-[#DCEAF3] bg-white px-4 py-4 shadow-xs transition sm:px-7 sm:py-5"
          >
            {/* Đường kẻ dọc màu xanh dương nhạt nối các chủ đề giống ảnh mẫu 1 */}
            {(isOpen || !isLast) && (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute left-[31px] top-12 z-10 w-[3px] bg-[#75BDEB] sm:left-[43px] ${
                  isLast ? 'bottom-5' : 'bottom-[-24px]'
                }`}
              />
            )}

            {/* Hàng tiêu đề lớn có số thứ tự tròn màu xanh dương nhạt */}
            <button
              type="button"
              onClick={() => toggleTopic(topic.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3.5 sm:gap-5">
                <span className="relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#75BDEB] text-sm font-bold text-white shadow-2xs">
                  {topic.orderNumber || index + 1}
                </span>

                <h3 className="text-base font-extrabold uppercase tracking-tight text-[#243B53] sm:text-lg">
                  {topic.title}
                </h3>
              </div>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#243B53] transition hover:bg-[#EAF6FD]">
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </span>
            </button>

            {/* Nội dung mở rộng bên trong */}
            {isOpen && (
              <div className="mt-4 pl-10 sm:pl-13">
                {hasSubTopics ? (
                  <div className="flex flex-col gap-3">
                    {topic.subTopics!.map((sub) => {
                      const isSubOpen = Boolean(openSubTopicIds[sub.id])
                      return (
                        <div
                          key={sub.id}
                          className="overflow-hidden rounded-md border border-[#E2E8F0] bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSubTopic(sub.id)}
                            aria-expanded={isSubOpen}
                            className="flex w-full items-center justify-between gap-3 bg-[#F4F6F8] px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-[#243B53] transition hover:bg-[#EAF6FD]/70"
                          >
                            <span>{sub.title}</span>
                            {isSubOpen ? (
                              <ChevronUp className="h-4 w-4 shrink-0 text-[#243B53]" />
                            ) : (
                              <ChevronDown className="h-4 w-4 shrink-0 text-[#243B53]" />
                            )}
                          </button>

                          {isSubOpen && (
                            <div className="grid grid-cols-2 gap-3 bg-white p-4 sm:grid-cols-3 md:grid-cols-5">
                              {sub.exercises.map((ex) => (
                                <Link
                                  key={`${sub.id}-${ex.id}-${ex.title}`}
                                  to={`/study-zone/practice/${ex.id}`}
                                  className="flex items-center rounded-md border border-[#75BDEB] bg-white px-4 py-2.5 text-sm font-medium text-[#243B53] transition hover:bg-[#EAF6FD] hover:text-[#2878B8]"
                                >
                                  {ex.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div className="pt-1">
                      <Link
                        to={topicDetailUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2878B8] hover:underline"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Xem tóm tắt lý thuyết & công thức chủ đề này</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-[#E2E8F0] bg-white p-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                      {topic.exercises.map((exercise) => (
                        <Link
                          key={exercise.id}
                          to={`/study-zone/practice/${exercise.id}`}
                          className="flex items-center rounded-md border border-[#75BDEB] bg-white px-4 py-2.5 text-sm font-medium text-[#243B53] transition hover:bg-[#EAF6FD] hover:text-[#2878B8]"
                        >
                          {exercise.title}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-3 border-t border-[#EAF6FD] pt-3">
                      <Link
                        to={topicDetailUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2878B8] hover:underline"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
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
            )}
          </div>
        )
      })}
    </div>
  )
}
