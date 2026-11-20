import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, FileCheck2, Headphones, Layers } from 'lucide-react'
import { STUDY_CATEGORY_PATHS, type StudyTopic } from '@/features/study-zone/types'

interface StudyTopicCardProps {
  topic: StudyTopic
}

export default function StudyTopicCard({ topic }: StudyTopicCardProps) {
  const detailPath = `${STUDY_CATEGORY_PATHS[topic.category]}/${topic.slug}`
  const actionLabel = topic.category === 'listening' ? 'Nghe ngay' : 'Học ngay'

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#DCEAF3] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#75BDEB] hover:shadow-md">
      {/* Ảnh đại diện chủ đề */}
      <Link to={detailPath} className="relative aspect-[16/9] w-full overflow-hidden bg-[#EAF6FD]">
        <img
          src={topic.thumbnail}
          alt={topic.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#2878B8]/95 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
          {topic.level}
        </span>
        {topic.listeningType && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#243B53] shadow-sm">
            {topic.listeningType}
          </span>
        )}
      </Link>

      {/* Thông tin chủ đề */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#2878B8]">
          {typeof topic.lessonsCount === 'number' && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {topic.lessonsCount} bài học
            </span>
          )}
          {typeof topic.wordsCount === 'number' && (
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {topic.wordsCount} từ vựng
            </span>
          )}
          {topic.durationLabel && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {topic.durationLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[#718096]">
            <FileCheck2 className="h-3.5 w-3.5 text-[#75BDEB]" />
            {topic.exercises.length} bài TEST
          </span>
        </div>

        <Link to={detailPath}>
          <h3 className="line-clamp-2 text-lg font-extrabold tracking-tight text-[#243B53] transition group-hover:text-[#2878B8]">
            {topic.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[#718096]">
          {topic.shortDescription}
        </p>

        {/* Phím tắt vào nhanh các bài TEST 1, TEST 2... */}
        {topic.exercises.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#EAF6FD] pt-3">
            {topic.exercises.map((ex) => (
              <Link
                key={ex.id}
                to={`/study-zone/practice/${ex.id}`}
                className="rounded-md border border-[#75BDEB] bg-[#F5FAFE] px-2.5 py-1 text-xs font-bold text-[#2878B8] transition hover:bg-[#75BDEB] hover:text-white"
              >
                {ex.title}
              </Link>
            ))}
          </div>
        )}

        {/* Nút Học ngay / Nghe ngay */}
        <div className="mt-4 pt-1">
          <Link
            to={detailPath}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#EAF6FD] px-4 py-2.5 text-sm font-extrabold text-[#2878B8] transition hover:bg-[#75BDEB] hover:text-white"
          >
            {topic.category === 'listening' ? (
              <Headphones className="h-4 w-4" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            <span>{actionLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
