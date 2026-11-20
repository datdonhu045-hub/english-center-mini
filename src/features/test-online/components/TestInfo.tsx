import { useState } from 'react'
import { CheckCircle2, Clock, FileText, Headphones, Layers, Volume2 } from 'lucide-react'
import type { Test } from '@/features/test-online/types/test.types'

interface TestInfoProps {
  test: Test
}

export default function TestInfo({ test }: TestInfoProps) {
  const [testingSpeaker, setTestingSpeaker] = useState(false)

  const handleSpeakerTest = () => {
    setTestingSpeaker(true)
    const audio = new Audio(test.sampleCheckAudioUrl)
    void audio
      .play()
      .then(() => {
        audio.onended = () => setTestingSpeaker(false)
      })
      .catch(() => {
        setTestingSpeaker(false)
      })
  }

  return (
    <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-xs sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EAF6FD] pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#EAF6FD] px-2.5 py-1 text-xs font-extrabold text-[#2878B8]">
              Mã đề: {test.code}
            </span>
            <span className="rounded-md bg-[#F5FAFE] px-2.5 py-1 text-xs font-bold text-[#243B53]">
              {test.testType}
            </span>
            <span className="rounded-md bg-[#EAF6FD] px-2.5 py-1 text-xs font-bold text-[#2878B8]">
              {test.difficulty}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#243B53] sm:text-3xl">
            {test.title}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[#718096]">{test.description}</p>
        </div>

        {/* Nút kiểm tra âm thanh loa/tai nghe độc lập trước khi vào phòng thi */}
        <button
          type="button"
          onClick={handleSpeakerTest}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#75BDEB] bg-[#EAF6FD] px-4 py-2.5 text-xs font-extrabold text-[#2878B8] shadow-2xs transition hover:bg-[#75BDEB] hover:text-white"
        >
          <Volume2 className={`h-4 w-4 ${testingSpeaker ? 'animate-bounce' : ''}`} />
          <span>{testingSpeaker ? 'Đang phát âm thanh mẫu...' : 'Kiểm tra loa / tai nghe'}</span>
        </button>
      </div>

      {/* Thông số tổng quan */}
      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF6FD] text-[#2878B8]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[#718096]">Thời gian mặc định</p>
            <p className="text-base font-extrabold text-[#243B53]">
              {test.duration} phút ({Math.round((test.duration / 60) * 10) / 10} giờ)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF6FD] text-[#2878B8]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[#718096]">Tổng số câu hỏi</p>
            <p className="text-base font-extrabold text-[#243B53]">
              {test.totalQuestions} câu hỏi thực hành
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF6FD] text-[#2878B8]">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[#718096]">Cấu trúc Part trong đề</p>
            <p className="text-base font-extrabold text-[#243B53]">
              {test.parts.length} Part (Part 1 – Part 7)
            </p>
          </div>
        </div>
      </div>

      {/* Hướng dẫn & Quy định phòng thi */}
      <div className="mt-5 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-4">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
          <Headphones className="h-4 w-4" />
          <span>Hướng dẫn & Quy định làm bài thi trực tuyến</span>
        </div>
        <ul className="mt-2.5 flex flex-col gap-2 text-xs leading-relaxed text-[#243B53] sm:text-sm">
          {test.generalInstructions.map((rule, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2878B8]" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
