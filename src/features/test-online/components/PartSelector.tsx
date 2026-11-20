import { CheckSquare, Headphones, BookOpen, Lock, Square } from 'lucide-react'
import type { TestPart, TestPracticeMode, ToeicPartNumber } from '@/features/test-online/types/test.types'

interface PartSelectorProps {
  parts: TestPart[]
  allowPartSelection: boolean
  practiceMode: TestPracticeMode
  selectedParts: ToeicPartNumber[]
  onModeChange: (nextMode: TestPracticeMode) => void
  onTogglePart: (partNumber: ToeicPartNumber) => void
  onSelectAllParts: () => void
  onClearAllParts: () => void
}

export default function PartSelector({
  parts,
  allowPartSelection,
  practiceMode,
  selectedParts,
  onModeChange,
  onTogglePart,
  onSelectAllParts,
  onClearAllParts,
}: PartSelectorProps) {
  const listeningParts = parts.filter((p) => p.section === 'listening')
  const readingParts = parts.filter((p) => p.section === 'reading')
  const selectedSet = new Set(selectedParts)

  const renderPartRow = (part: TestPart, rowIndex: number) => {
    const isChecked = selectedSet.has(part.partNumber)
    const isLocked = practiceMode === 'custom_parts' && !part.allowStandaloneSelection

    return (
      <div
        key={part.id}
        onClick={() => {
          if (practiceMode === 'custom_parts' && !isLocked) {
            onTogglePart(part.partNumber)
          }
        }}
        className={`grid grid-cols-[44px_minmax(0,1fr)_130px] items-center border-b border-[#DCEAF3] last:border-b-0 sm:grid-cols-[54px_minmax(0,1fr)_170px] ${
          practiceMode === 'custom_parts' && !isLocked ? 'cursor-pointer' : ''
        } ${
          isChecked
            ? 'bg-[#EAF6FD]/60 text-[#243B53]'
            : 'bg-white text-[#718096] hover:bg-[#F5FAFE]'
        }`}
      >
        {/* Cột số thứ tự màu cam nhạt/xanh giống hình mẫu 2 */}
        <div
          className={`flex h-full items-center justify-center py-3 text-sm font-extrabold ${
            isChecked ? 'bg-[#75BDEB]/30 text-[#2878B8]' : 'bg-[#F5FAFE] text-[#718096]'
          }`}
        >
          {rowIndex + 1}
        </div>

        {/* Tên Part & Checkbox */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5">
            {practiceMode === 'custom_parts' && (
              <span className="text-[#2878B8]">
                {isLocked ? (
                  <Lock className="h-4 w-4 text-amber-600" />
                ) : isChecked ? (
                  <CheckSquare className="h-4 w-4 text-[#2878B8]" />
                ) : (
                  <Square className="h-4 w-4 text-[#718096]" />
                )}
              </span>
            )}
            <div>
              <span className="text-sm font-extrabold text-[#243B53]">
                {part.title} – {part.englishTitle}
              </span>
              <span className="ml-2 hidden text-xs text-[#718096] sm:inline">
                ({part.vietnameseTitle})
              </span>
            </div>
          </div>

          {isLocked && (
            <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              Khóa chọn lẻ (chỉ thi trong Full Test)
            </span>
          )}
        </div>

        {/* Số câu hỏi & thời gian gợi ý */}
        <div className="border-l border-[#DCEAF3] px-3 py-3 text-right sm:px-4">
          <span className="text-xs font-extrabold text-[#243B53] sm:text-sm">
            {part.questionCount} CÂU
          </span>
          <span className="block text-[11px] text-[#718096]">
            Gợi ý ~{part.suggestedMinutes} phút
          </span>
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-xs sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAF6FD] pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#243B53] sm:text-xl">
            1. Lựa chọn hình thức & Cấu trúc Part làm bài
          </h2>
          <p className="mt-0.5 text-xs text-[#718096]">
            Chọn làm toàn bộ đề thi (Full Test) hoặc tích chọn từng Part bạn muốn luyện tập.
          </p>
        </div>

        {/* 2 chế độ: Làm toàn bộ đề vs Tự chọn Part */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onModeChange('full')}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              practiceMode === 'full'
                ? 'bg-[#2878B8] text-white shadow-xs'
                : 'border border-[#DCEAF3] bg-[#F5FAFE] text-[#243B53] hover:border-[#75BDEB]'
            }`}
          >
            Làm toàn bộ đề ({parts.length} Part)
          </button>

          {allowPartSelection && (
            <button
              type="button"
              onClick={() => onModeChange('custom_parts')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                practiceMode === 'custom_parts'
                  ? 'bg-[#F26522] text-white shadow-xs'
                  : 'border border-[#DCEAF3] bg-[#F5FAFE] text-[#243B53] hover:border-[#75BDEB]'
              }`}
            >
              <span>Tự chọn từng Part</span>
            </button>
          )}
        </div>
      </div>

      {/* Thanh công cụ Chọn tất cả / Bỏ chọn tất cả khi ở chế độ Tự chọn Part */}
      {practiceMode === 'custom_parts' && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#75BDEB] bg-[#EAF6FD]/60 px-4 py-2.5 text-xs">
          <span className="font-bold text-[#243B53]">
            Đang chọn:{' '}
            <strong className="text-[#2878B8]">
              {selectedParts.length > 0
                ? selectedParts.map((p) => `Part ${p}`).join(', ')
                : 'Chưa chọn Part nào'}
            </strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAllParts}
              className="rounded-lg bg-white px-3 py-1 font-extrabold text-[#2878B8] shadow-2xs transition hover:bg-[#2878B8] hover:text-white"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={onClearAllParts}
              className="rounded-lg bg-white px-3 py-1 font-extrabold text-[#718096] shadow-2xs transition hover:bg-rose-600 hover:text-white"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      )}

      {/* Bảng LISTENING (Part 1 - Part 4) giống hình tham khảo 2 */}
      <div className="mt-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#243B53]">
          <Headphones className="h-4 w-4 text-[#2878B8]" />
          <span>LISTENING (NGHE HIỂU – CHỈ NGHE 1 LẦN)</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#DCEAF3]">
          {listeningParts.map((part, idx) => renderPartRow(part, idx))}
        </div>
      </div>

      {/* Bảng READING (Part 5 - Part 7) */}
      <div className="mt-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#243B53]">
          <BookOpen className="h-4 w-4 text-[#2878B8]" />
          <span>READING (ĐỌC HIỂU)</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#DCEAF3]">
          {readingParts.map((part, idx) => renderPartRow(part, idx))}
        </div>
      </div>
    </section>
  )
}
