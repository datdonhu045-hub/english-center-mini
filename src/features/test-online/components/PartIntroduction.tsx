import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Play,
  Sparkles,
} from 'lucide-react'
import ImageViewer from '@/features/study-zone/components/ImageViewer'
import type { TestPart } from '@/features/test-online/types/test.types'

interface PartIntroductionProps {
  part: TestPart
  currentPartOrderIndex: number // 1..N trong số các Part học viên đã chọn
  totalSelectedParts: number
  formattedRemainingTime: string
  listeningJustCompletedNotice?: boolean
  onStartPart: () => void
}

/**
 * Màn hình giới thiệu riêng trước mỗi Part (Part 1 -> Part 7).
 * - Hiển thị trước khi làm câu hỏi đầu tiên của Part đó.
 * - Tuyệt đối không tự động phát audio trong màn hình giới thiệu.
 * - Đồng hồ tổng thời gian của bài thi vẫn chạy liên tục.
 */
export default function PartIntroduction({
  part,
  currentPartOrderIndex,
  totalSelectedParts,
  formattedRemainingTime,
  listeningJustCompletedNotice = false,
  onStartPart,
}: PartIntroductionProps) {
  const isListening = part.section === 'listening'

  return (
    <div className="ec-reading-font mx-auto max-w-4xl">
      {/* Thông báo khi vừa hoàn thành toàn bộ phần Listening và tự động chuyển sang giới thiệu Reading */}
      {listeningJustCompletedNotice && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-[#75BDEB] bg-[#EAF6FD] p-4 text-sm font-bold text-[#243B53] shadow-xs">
          <Sparkles className="h-5 w-5 shrink-0 text-[#2878B8]" />
          <span>
            Bạn đã hoàn thành phần Listening. Bây giờ hãy tiếp tục phần Reading.
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#DCEAF3] bg-white shadow-sm">
        {/* Header giới thiệu Part */}
        <div className="border-b border-[#DCEAF3] bg-gradient-to-r from-[#EAF6FD] via-[#F5FAFE] to-white px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2878B8] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                {isListening ? (
                  <Headphones className="h-3.5 w-3.5" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5" />
                )}
                <span>{isListening ? 'Phần thi Listening' : 'Phần thi Reading'}</span>
              </span>

              <span className="rounded-full border border-[#75BDEB] bg-white px-3 py-1 text-xs font-extrabold text-[#2878B8]">
                Part {currentPartOrderIndex} / {totalSelectedParts} Part đã chọn
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#75BDEB] bg-white px-3 py-1.5 text-xs font-bold text-[#243B53]">
              <Clock className="h-3.5 w-3.5 text-[#2878B8]" />
              <span>Thời gian làm bài:</span>
              <strong className="font-mono text-sm text-[#2878B8]">{formattedRemainingTime}</strong>
              <span className="rounded bg-[#EAF6FD] px-1.5 py-0.5 text-[10px] font-extrabold text-[#2878B8]">
                Chưa tính giờ
              </span>
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-[#243B53] sm:text-3xl">
            {part.title} – {part.englishTitle}
          </h2>
          <p className="mt-1 text-sm font-bold text-[#2878B8]">{part.vietnameseTitle}</p>
        </div>

        {/* Nội dung hướng dẫn chi tiết lấy từ cấu hình của Part */}
        <div className="p-6 sm:p-8">
          {/* Thông số nhanh của Part */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF6FD] text-[#2878B8]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#718096]">Số lượng câu hỏi trong Part</p>
                <p className="text-base font-extrabold text-[#243B53]">
                  {part.questionCount} câu hỏi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF6FD] text-[#2878B8]">
                {isListening ? (
                  <Headphones className="h-5 w-5" />
                ) : (
                  <BookOpen className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-xs text-[#718096]">Dạng nội dung xuất hiện</p>
                <p className="text-sm font-extrabold text-[#243B53]">{part.contentTypesLabel}</p>
              </div>
            </div>
          </div>

          {/* Mô tả Part */}
          <div className="mt-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
              Giới thiệu nội dung
            </h3>
            <p className="mt-2 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-4 text-sm leading-relaxed text-[#243B53] sm:text-base">
              {part.description}
            </p>
          </div>

          {/* Hình ảnh / Nội dung minh họa trong màn hình giới thiệu (nếu có) */}
          {part.introductionBlocks && part.introductionBlocks.length > 0 && (
            <div className="mt-5 flex flex-col gap-3">
              {part.introductionBlocks.map((block) => {
                if (block.type === 'image') {
                  return (
                    <ImageViewer
                      key={block.id}
                      src={block.url}
                      alt={block.alt ?? part.title}
                      caption={block.caption}
                      compact
                    />
                  )
                }
                if (block.type === 'text') {
                  return (
                    <p
                      key={block.id}
                      className="rounded-xl border border-[#DCEAF3] bg-white p-3.5 text-sm text-[#243B53]"
                    >
                      {block.content}
                    </p>
                  )
                }
                return null
              })}
            </div>
          )}

          {/* Hướng dẫn làm bài */}
          <div className="mt-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
              Hướng dẫn làm bài ({part.title})
            </h3>
            <ul className="mt-2.5 flex flex-col gap-2.5">
              {part.instructions.map((inst, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 rounded-xl border border-[#DCEAF3] bg-white px-4 py-3 text-sm text-[#243B53]"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2878B8]" />
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lưu ý quan trọng */}
          {part.importantNotes.length > 0 && (
            <div className="mt-6 rounded-xl border border-[#75BDEB] bg-[#EAF6FD]/70 p-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
                <AlertCircle className="h-4 w-4" />
                <span>Lưu ý quan trọng</span>
              </div>
              <ul className="mt-2 flex flex-col gap-1.5 text-xs font-medium text-[#243B53] sm:text-sm">
                {part.importantNotes.map((note, idx) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Nút Bắt đầu Part */}
          <div className="mt-7 flex flex-col items-center justify-between gap-4 border-t border-[#EAF6FD] pt-5 sm:flex-row">
            <p className="text-xs text-[#718096]">
              {isListening
                ? 'Thời gian đọc giới thiệu không tính giờ. Khi nhấn Bắt đầu Part, đồng hồ sẽ tính giờ và phát Audio 1 lần.'
                : 'Thời gian đọc giới thiệu không tính giờ. Khi nhấn Bắt đầu Part, đồng hồ sẽ tiếp tục tính giờ làm bài.'}
            </p>

            <button
              type="button"
              onClick={onStartPart}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F26522] px-7 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#d95314] sm:w-auto"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>BẮT ĐẦU {part.title}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
