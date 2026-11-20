import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, ChevronUp, Clock, FileCheck2, Flame, Users } from 'lucide-react'
import type { Test } from '@/features/test-online/types/test.types'

interface TestCardProps {
  test: Test
}

export function TestCard({ test }: TestCardProps) {
  const detailPath = `/test-online/${test.slug}`

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#DCEAF3] bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#75BDEB] hover:shadow-md">
      {/* Ảnh đại diện đề thi */}
      <Link to={detailPath} className="relative aspect-[16/9] w-full overflow-hidden bg-[#EAF6FD]">
        <img
          src={test.thumbnail}
          alt={test.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#2878B8]/95 px-3 py-1 text-xs font-extrabold text-white shadow-xs">
          {test.difficulty}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-[#243B53] shadow-xs">
          {test.testType}
        </span>
      </Link>

      {/* Thông tin đề thi */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-[#2878B8]">
          <span>Mã đề: {test.code}</span>
          <span className="rounded bg-[#EAF6FD] px-2 py-0.5 text-[11px] text-[#2878B8]">
            Đang mở thi
          </span>
        </div>

        <Link to={detailPath}>
          <h3 className="text-lg font-extrabold tracking-tight text-[#243B53] transition group-hover:text-[#2878B8]">
            {test.title}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-[#718096]">
          {test.description}
        </p>

        {/* Thông số đề thi */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-2.5 text-center text-xs">
          <div>
            <p className="text-[11px] text-[#718096]">Số câu</p>
            <p className="font-extrabold text-[#243B53]">
              {test.totalQuestions} câu ({test.parts.length} Part)
            </p>
          </div>
          <div className="border-x border-[#DCEAF3]">
            <p className="text-[11px] text-[#718096]">Thời gian</p>
            <p className="inline-flex items-center gap-1 font-extrabold text-[#243B53]">
              <Clock className="h-3 w-3 text-[#2878B8]" />
              {test.duration} phút
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#718096]">Lượt thi</p>
            <p className="inline-flex items-center gap-1 font-extrabold text-[#2878B8]">
              <Users className="h-3 w-3" />
              {test.attemptsCount.toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        {/* 2 nút hành động: Xem chi tiết & Bắt đầu thi */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Link
            to={detailPath}
            className="inline-flex items-center justify-center rounded-xl border border-[#75BDEB] bg-white px-3 py-2.5 text-xs font-extrabold text-[#2878B8] transition hover:bg-[#EAF6FD]"
          >
            Xem chi tiết
          </Link>
          <Link
            to={detailPath}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2878B8] px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#1f5f94]"
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Bắt đầu thi</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

interface TestCollectionTimelineProps {
  tests: Test[]
}

/**
 * Chế độ hiển thị Bộ đề theo Lộ trình năm (Timeline Accordion giống hình tham khảo 1:
 * "TOEIC LISTENING & READING – FULL TEST", "1 -> 2026 (New) 🔥 -> TEST 1 – 2026 (275.192 lượt hoàn thành)").
 */
export function TestCollectionTimeline({ tests }: TestCollectionTimelineProps) {
  const groups = Array.from(new Set(tests.map((t) => t.collectionGroup)))
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const g of groups) init[g] = true
    return init
  })

  return (
    <div className="relative flex flex-col gap-5">
      {/* Header tiêu đề tổng của lộ trình */}
      <div className="relative flex items-center gap-4 rounded-xl border border-[#DCEAF3] bg-white px-5 py-4 shadow-xs">
        <span className="relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2878B8] ring-4 ring-[#EAF6FD]" />
        <h2 className="text-base font-black uppercase tracking-wide text-[#243B53] sm:text-lg">
          TOEIC LISTENING & READING – FULL TEST & PART PRACTICE
        </h2>
      </div>

      {groups.map((groupName, idx) => {
        const groupTests = tests.filter((t) => t.collectionGroup === groupName)
        const isOpen = Boolean(openGroups[groupName])
        const isLast = idx === groups.length - 1

        return (
          <div
            key={groupName}
            className="relative rounded-2xl border border-[#DCEAF3] bg-white p-5 shadow-xs sm:p-6"
          >
            {!isLast && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-24px] left-[35px] top-12 z-10 w-[3px] bg-[#75BDEB] sm:left-[39px]"
              />
            )}

            <button
              type="button"
              onClick={() => setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }))}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2878B8] text-sm font-extrabold text-white ring-4 ring-[#EAF6FD]">
                  {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-[#F26522]">{groupName}</span>
                  <Flame className="h-5 w-5 fill-[#F26522] text-[#F26522]" />
                  <span className="ml-2 rounded-full bg-[#EAF6FD] px-2.5 py-0.5 text-xs font-bold text-[#2878B8]">
                    {groupTests.length} đề thi
                  </span>
                </div>
              </div>

              <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#2878B8] hover:bg-[#EAF6FD]">
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </span>
            </button>

            {isOpen && (
              <div className="mt-5 grid grid-cols-1 gap-3.5 pl-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:pl-12">
                {groupTests.map((test) => (
                  <Link
                    key={test.id}
                    to={`/test-online/${test.slug}`}
                    className="group flex flex-col justify-between rounded-xl border border-[#75BDEB] bg-white p-4 shadow-2xs transition hover:-translate-y-0.5 hover:border-[#2878B8] hover:bg-[#F5FAFE] hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black uppercase text-[#243B53] group-hover:text-[#2878B8]">
                          {test.title}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#2878B8] transition group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#718096]">
                        {test.attemptsCount.toLocaleString('vi-VN')} lượt hoàn thành
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-[#EAF6FD] pt-2 text-[11px] font-bold text-[#2878B8]">
                      <span>{test.totalQuestions} câu ({test.parts.length} Part)</span>
                      <span>{test.duration} phút</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
