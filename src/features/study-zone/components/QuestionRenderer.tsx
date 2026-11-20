import { Lightbulb, Volume2 } from 'lucide-react'
import AudioPlayer from '@/features/study-zone/components/AudioPlayer'
import ImageViewer from '@/features/study-zone/components/ImageViewer'
import AnswerOption from '@/features/study-zone/components/AnswerOption'
import type {
  Question,
  QuestionContentBlock,
  QuestionReviewItem,
} from '@/features/study-zone/types'

interface QuestionRendererProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  selectedOptionId: string | null
  submitted: boolean
  review?: QuestionReviewItem
  onSelectOption: (optionId: string) => void
}

function renderContentBlock(block: QuestionContentBlock) {
  switch (block.type) {
    case 'text': {
      if (block.variant === 'instruction') {
        return (
          <p key={block.id} className="text-sm font-semibold text-[#2878B8] sm:text-base">
            {block.content}
          </p>
        )
      }
      if (block.variant === 'passage') {
        return (
          <div
            key={block.id}
            className="rounded-xl border border-[#DCEAF3] bg-[#F8FAFC] p-5 text-[15.5px] font-normal leading-[1.78] text-[#1E293B]"
          >
            {block.content}
          </div>
        )
      }
      return (
        <p
          key={block.id}
          className="rounded-xl border border-[#DCEAF3] bg-[#F8FAFC] p-4 text-[16px] font-semibold leading-[1.68] text-[#1E293B] sm:text-[17px]"
        >
          {block.content}
        </p>
      )
    }

    case 'audio':
      return (
        <AudioPlayer
          key={block.id}
          src={block.url}
          title={block.title}
          defaultDurationSeconds={block.durationSeconds}
        />
      )

    case 'image':
      return (
        <ImageViewer
          key={block.id}
          src={block.url}
          alt={block.alt}
          caption={block.caption}
        />
      )
  }
}

/**
 * Hệ thống Question Renderer dùng chung cho cả 3 danh mục (Ngữ pháp, Từ vựng, Luyện nghe):
 * - Hỗ trợ câu hỏi chỉ có chữ, chỉ có ảnh, chỉ có audio hoặc kết hợp đồng thời cả chữ + ảnh + audio.
 * - Khi câu hỏi có hình ảnh hoặc file ghi âm: tự động chia bố cục 2 cột giống hệt ảnh thiết kế mẫu (Cột trái: Audio + Ảnh + Transcript | Cột phải: Câu hỏi + Các đáp án A/B/C/D + Lời giải chi tiết).
 * - Khi câu hỏi chỉ có văn bản: hiển thị gọn gàng, giữ thứ tự các khối theo đúng dữ liệu từ Admin.
 */
export default function QuestionRenderer({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  submitted,
  review,
  onSelectOption,
}: QuestionRendererProps) {
  const mediaBlocks = question.content.filter((b) => b.type === 'audio' || b.type === 'image')
  const textBlocks = question.content.filter((b) => b.type === 'text')
  const hasMediaColumn = mediaBlocks.length > 0

  return (
    <div className="ec-reading-font overflow-hidden rounded-2xl border border-[#DCEAF3] bg-white shadow-sm">
      <div
        className={`grid grid-cols-1 ${
          hasMediaColumn ? 'lg:grid-cols-12' : ''
        }`}
      >
        {/* CỘT TRÁI (nếu câu hỏi có Audio và/hoặc Hình ảnh) */}
        {hasMediaColumn && (
          <section className="flex flex-col gap-4 border-b border-[#DCEAF3] bg-[#F5FAFE]/70 p-5 sm:p-6 lg:col-span-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
                <Volume2 className="h-4 w-4" />
                Tài liệu nghe & Hình ảnh mô tả
              </span>
              <span className="rounded-full bg-[#EAF6FD] px-3 py-1 text-xs font-bold text-[#2878B8]">
                Câu {questionIndex + 1}/{totalQuestions}
              </span>
            </div>

            {/* Hiển thị lần lượt các khối Audio / Hình ảnh theo đúng thứ tự Admin cấu hình */}
            <div className="space-y-4">
              {mediaBlocks.map((block) => renderContentBlock(block))}
            </div>

            {/* Audio Script & Dịch nghĩa (Chỉ mở khóa sau khi đã nộp bài) */}
            {submitted && review?.audioTranscript && (
              <div className="mt-2 rounded-xl border border-[#A7D8F5] bg-[#EAF6FD] p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#2878B8]">
                  Lời thoại bài nghe (Audio Script):
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#243B53]">
                  {review.audioTranscript}
                </p>
                {review.audioTranslation && (
                  <p className="mt-1 text-xs italic text-[#718096]">
                    {review.audioTranslation}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* CỘT PHẢI: Nội dung câu hỏi, Các phương án A/B/C/D & Giải thích sau khi nộp */}
        <section
          className={`flex flex-col justify-between p-5 sm:p-7 ${
            hasMediaColumn ? 'lg:col-span-6' : ''
          }`}
        >
          <div>
            {/* Tiêu đề câu hỏi */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCEAF3] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="h-5 w-2 rounded-full bg-[#2878B8]" />
                <h2 className="text-base font-extrabold text-[#243B53] sm:text-lg">
                  Câu hỏi số {questionIndex + 1}
                </h2>
              </div>

              {question.difficulty && (
                <span className="rounded-md bg-[#F5FAFE] px-2.5 py-1 text-xs font-semibold text-[#718096]">
                  Độ khó: <strong className="text-[#243B53]">{question.difficulty}</strong>
                </span>
              )}
            </div>

            {/* Các khối văn bản của câu hỏi */}
            {textBlocks.length > 0 && (
              <div className="mt-4 space-y-3">
                {textBlocks.map((block) => renderContentBlock(block))}
              </div>
            )}

            {/* Danh sách lựa chọn A, B, C, D */}
            <div
              role="radiogroup"
              aria-label={`Các phương án câu ${questionIndex + 1}`}
              className="mt-5 space-y-3.5"
            >
              {question.options.map((option) => (
                <AnswerOption
                  key={option.id}
                  option={option}
                  selected={selectedOptionId === option.id}
                  submitted={submitted}
                  isCorrectOption={
                    submitted && review ? review.correctOptionId === option.id : false
                  }
                  onSelect={onSelectOption}
                />
              ))}
            </div>

            {/* Hộp Giải thích chi tiết (Chỉ hiển thị sau khi đã nộp bài và chấm điểm) */}
            {submitted && review && (
              <div className="mt-6 rounded-2xl border border-[#A7D8F5] bg-gradient-to-br from-[#EAF6FD] to-[#F5FAFE] p-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2878B8] text-white">
                    <Lightbulb className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#243B53] sm:text-sm">
                    Giải thích chi tiết & Phân tích đáp án
                  </h3>
                </div>

                <div className="space-y-1.5 whitespace-pre-line text-sm leading-relaxed text-[#243B53]">
                  {review.explanation}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
