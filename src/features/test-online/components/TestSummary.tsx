import { AlertCircle, CheckCircle2, Play } from 'lucide-react'
import type { TestPart, TestPracticeMode, ToeicPartNumber } from '@/features/test-online/types/test.types'

interface TestSummaryProps {
  testTitle: string
  testCode: string
  practiceMode: TestPracticeMode
  selectedParts: ToeicPartNumber[]
  activePartObjects: TestPart[]
  totalSelectedQuestions: number
  selectedDuration: number
  starting: boolean
  onStartExam: () => void
}

export default function TestSummary({
  testTitle,
  testCode,
  practiceMode,
  selectedParts,
  activePartObjects,
  totalSelectedQuestions,
  selectedDuration,
  starting,
  onStartExam,
}: TestSummaryProps) {
  const canStart = selectedParts.length > 0 && totalSelectedQuestions > 0 && !starting
  const hasListening = activePartObjects.some((p) => p.section === 'listening')
  const hasReading = activePartObjects.some((p) => p.section === 'reading')

  const scopeLabel =
    hasListening && hasReading
      ? 'Listening & Reading (Hoàn thành Listening trước khi mở Reading)'
      : hasListening
        ? 'Chỉ làm phần Listening (Nghe hiểu 1 lần)'
        : hasReading
          ? 'Chỉ làm phần Reading (Đọc hiểu)'
          : 'Chưa chọn Part'

  return (
    <section className="rounded-2xl border-2 border-[#75BDEB] bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-2 border-b border-[#EAF6FD] pb-4">
        <CheckCircle2 className="h-5 w-5 text-[#2878B8]" />
        <h2 className="text-lg font-extrabold uppercase text-[#243B53] sm:text-xl">
          3. TÓM TẮT XÁC NHẬN TRƯỚC KHI BẮT ĐẦU
        </h2>
      </div>

      {/* Bảng xác nhận thông số lượt thi */}
      <div className="mt-4 overflow-hidden rounded-xl border border-[#DCEAF3]">
        <table className="w-full text-left text-xs sm:text-sm">
          <tbody className="divide-y divide-[#DCEAF3]">
            <tr className="bg-[#F5FAFE]">
              <th className="w-2/5 px-4 py-3 font-bold text-[#718096]">Đề thi</th>
              <td className="px-4 py-3 font-extrabold text-[#243B53]">
                {testTitle} <span className="ml-1 text-xs text-[#2878B8]">({testCode})</span>
              </td>
            </tr>
            <tr className="bg-white">
              <th className="px-4 py-3 font-bold text-[#718096]">Hình thức</th>
              <td className="px-4 py-3 font-extrabold text-[#2878B8]">
                {practiceMode === 'full' ? 'Làm toàn bộ đề (Full Test)' : 'Tự chọn Part'}
              </td>
            </tr>
            <tr className="bg-[#F5FAFE]">
              <th className="px-4 py-3 font-bold text-[#718096]">Part đã chọn</th>
              <td className="px-4 py-3 font-extrabold text-[#243B53]">
                {selectedParts.length > 0
                  ? selectedParts.map((p) => `Part ${p}`).join(', ')
                  : 'Chưa chọn Part nào'}
              </td>
            </tr>
            <tr className="bg-white">
              <th className="px-4 py-3 font-bold text-[#718096]">Phạm vi bài thi</th>
              <td className="px-4 py-3 font-semibold text-[#243B53]">{scopeLabel}</td>
            </tr>
            <tr className="bg-[#F5FAFE]">
              <th className="px-4 py-3 font-bold text-[#718096]">Tổng số câu</th>
              <td className="px-4 py-3 font-extrabold text-[#243B53]">
                {totalSelectedQuestions} câu hỏi
              </td>
            </tr>
            <tr className="bg-white">
              <th className="px-4 py-3 font-bold text-[#718096]">Thời gian</th>
              <td className="px-4 py-3 font-extrabold text-[#F26522]">{selectedDuration} phút</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!canStart && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Vui lòng chọn ít nhất 1 Part để có thể bắt đầu làm bài thi.</span>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#EAF6FD] pt-5 sm:flex-row">
        <p className="text-xs leading-relaxed text-[#718096]">
          Khi nhấn <strong>BẮT ĐẦU LÀM BÀI</strong>, hệ thống sẽ tạo một <strong>Attempt ID</strong>{' '}
          mới và mở màn hình giới thiệu của <strong>Part {selectedParts[0] ?? 1}</strong>. Đồng hồ{' '}
          {selectedDuration} phút chỉ bắt đầu tính giờ khi bạn nhấn <strong>BẮT ĐẦU PART</strong>.
        </p>

        <button
          type="button"
          disabled={!canStart}
          onClick={onStartExam}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F26522] px-8 py-4 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#d95314] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>{starting ? 'Đang khởi tạo phòng thi...' : 'BẮT ĐẦU LÀM BÀI'}</span>
        </button>
      </div>
    </section>
  )
}
