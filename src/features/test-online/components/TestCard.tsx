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
      <Link to={detailPath} className="relative aspect-[16/9] w-full overflow-hidden bg-[#EAF6FD]">
        <img
          src={test.thumbnail}
          alt={test.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#75BDEB] px-3 py-1 text-xs font-extrabold text-white shadow-xs">
          {test.difficulty}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-[#243B53] shadow-xs">
          {test.testType}
        </span>
      </Link>

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

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-2.5 text-center text-xs">
          <div>
            <p className="text-[11px] text-[#718096]">Số câu</p>
            <p className="font-extrabold text-[#243B53]">
              {test.standardTotalQuestions} câu
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

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Link
            to={detailPath}
            className="inline-flex items-center justify-center rounded-xl border border-[#75BDEB] bg-white px-3 py-2.5 text-xs font-extrabold text-[#2878B8] transition hover:bg-[#EAF6FD]"
          >
            Xem chi tiết
          </Link>
          <Link
            to={detailPath}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#75BDEB] px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#5aaee3]"
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
  headingTitle?: string
}

/**
 * Chế độ hiển thị Bộ đề theo Lộ trình năm giống hệt ảnh mẫu 3:
 * - Khung tiêu đề tròn xanh dương nhạt + đường dọc nối xuống các bộ năm "1 -> 2026 (New) 🔥"
 * - Các ô thẻ đề thi gọn sạch: "TEST 1 – 2026 ->" và "275.192 lượt hoàn thành"
 */
export function TestCollectionTimeline({
  tests,
  headingTitle = 'TOEIC LISTENING & READING - FULL TEST',
}: TestCollectionTimelineProps) {
  const groups = Array.from(new Set(tests.map((t) => t.collectionGroup)))
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const g of groups) init[g] = true
    return init
  })

  return (
    <div className="relative flex flex-col gap-5">
      {/* Khung Header lộ trình với đường kẻ dọc nối xuống khối số 1 giống ảnh mẫu 3 */}
      <div className="relative flex items-center gap-4 rounded-lg border border-[#DCEAF3] bg-white px-5 py-3.5 shadow-2xs">
        {groups.length > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-24px] left-[33px] top-10 z-10 w-[3px] bg-[#75BDEB]"
          />
        )}
        <span className="relative z-20 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#75BDEB]" />
        <h2 className="text-base font-extrabold uppercase tracking-wide text-[#243B53] sm:text-[17px]">
          {headingTitle}
        </h2>
      </div>

      {groups.map((groupName, idx) => {
        const groupTests = tests.filter((t) => t.collectionGroup === groupName)
        const isOpen = Boolean(openGroups[groupName])
        const isLast = idx === groups.length - 1

        return (
          <div
            key={groupName}
            className="relative rounded-lg border border-[#DCEAF3] bg-white p-5 shadow-2xs sm:p-6"
          >
            {(isOpen || !isLast) && (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute left-[33px] top-12 z-10 w-[3px] bg-[#75BDEB] ${
                  isLast ? 'bottom-5' : 'bottom-[-24px]'
                }`}
              />
            )}

            <button
              type="button"
              onClick={() => setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }))}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="relative z-20 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#75BDEB] text-xs font-extrabold text-white">
                  {idx + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-[#F26522]">{groupName}</span>
                  {groupName.toLowerCase().includes('new') && (
                    <Flame className="h-5 w-5 fill-[#F26522] text-[#F26522]" />
                  )}
                </div>
              </div>

              <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#75BDEB] hover:bg-[#EAF6FD]">
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </span>
            </button>

            {isOpen && (
              <div className="mt-5 grid grid-cols-1 gap-3.5 pl-9 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:pl-11">
                {groupTests.map((test) => (
                  <Link
                    key={test.id}
                    to={`/test-online/${test.slug}`}
                    className="group flex flex-col justify-between rounded-lg border border-[#75BDEB] bg-white px-4 py-3.5 transition hover:bg-[#F5FAFE] hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold uppercase text-[#243B53] group-hover:text-[#2878B8]">
                        {test.title}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#243B53] transition group-hover:translate-x-0.5 group-hover:text-[#2878B8]" />
                    </div>
                    <p className="mt-1.5 text-xs text-[#4A5568]">
                      {test.attemptsCount.toLocaleString('vi-VN')} lượt hoàn thành
                    </p>
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
