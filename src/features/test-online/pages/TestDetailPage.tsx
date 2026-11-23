import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckSquare, Play, Square, Volume2 } from 'lucide-react'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useTestDetailBySlug } from '@/features/test-online/hooks/useTests'
import { attemptApi } from '@/features/test-online/api/attemptApi'
import type {
  TestPart,
  TestPracticeMode,
  ToeicPartNumber,
} from '@/features/test-online/types/test.types'

export default function TestDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: test, loading, error, retry } = useTestDetailBySlug(slug)

  const [practiceMode, setPracticeMode] = useState<TestPracticeMode>('full')
  const [customSelectedParts, setCustomSelectedParts] = useState<ToeicPartNumber[] | null>(null)
  const [userDurationOverride, setUserDurationOverride] = useState<number | null>(null)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [testingSpeaker, setTestingSpeaker] = useState(false)

  const selectedParts = useMemo<ToeicPartNumber[]>(() => {
    if (!test) return []
    if (practiceMode === 'full' || customSelectedParts === null) {
      return test.parts.map((p) => p.partNumber)
    }
    return customSelectedParts
  }, [test, practiceMode, customSelectedParts])

  const selectedDuration = userDurationOverride ?? test?.duration ?? 120

  const handleToggleCustomMode = () => {
    if (!test) return
    if (practiceMode === 'full') {
      setPracticeMode('custom_parts')
      setCustomSelectedParts(test.parts.map((p) => p.partNumber))
    } else {
      setPracticeMode('full')
      setCustomSelectedParts(test.parts.map((p) => p.partNumber))
      setUserDurationOverride(test.duration)
    }
  }

  const handleTogglePart = (partNumber: ToeicPartNumber) => {
    if (!test) return
    const partObj = test.parts.find((p) => p.partNumber === partNumber)
    if (!partObj) return

    // Nếu đang ở Full Test mà người dùng bấm vào 1 dòng Part, tự động bật chế độ "Chọn từng part"
    const current =
      practiceMode === 'full' || customSelectedParts === null
        ? test.parts.map((p) => p.partNumber)
        : customSelectedParts

    if (practiceMode === 'full') {
      setPracticeMode('custom_parts')
    }

    const exists = current.includes(partNumber)
    const next = exists ? current.filter((p) => p !== partNumber) : [...current, partNumber]
    setCustomSelectedParts(next.sort((a, b) => a - b) as ToeicPartNumber[])
  }

  const handleSpeakerTest = () => {
    if (!test) return
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

  const handleStartExam = async () => {
    if (!test || selectedParts.length === 0 || starting) return
    setStarting(true)
    setStartError(null)
    try {
      const attempt = await attemptApi.startAttempt({
        testId: test.id,
        testSlug: test.slug,
        practiceMode,
        selectedParts,
        selectedDuration,
      })
      navigate(`/test-online/attempt/${attempt.id}`)
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : 'Không thể khởi tạo lượt thi. Vui lòng thử lại.',
      )
      setStarting(false)
    }
  }

  const listeningParts = useMemo(
    () => (test ? test.parts.filter((p) => p.section === 'listening') : []),
    [test],
  )
  const readingParts = useMemo(
    () => (test ? test.parts.filter((p) => p.section === 'reading') : []),
    [test],
  )
  const selectedSet = useMemo(() => new Set(selectedParts), [selectedParts])
  const canStart = selectedParts.length > 0 && !starting

  const renderPartRow = (part: TestPart, rowIndex: number) => {
    const isChecked = selectedSet.has(part.partNumber)
    const isCustom = practiceMode === 'custom_parts'

    return (
      <div
        key={part.id}
        onClick={() => {
          if (isCustom) {
            handleTogglePart(part.partNumber)
          }
        }}
        className={`grid grid-cols-[48px_minmax(0,1fr)_140px] items-center border-b border-[#F2D5B8] last:border-b-0 sm:grid-cols-[56px_minmax(0,1fr)_200px] ${
          isCustom ? 'cursor-pointer' : ''
        } ${isChecked ? 'bg-white' : 'bg-slate-50/70 opacity-60'}`}
      >
        {/* Ô số thứ tự bên trái màu cam nhạt giống hệt ảnh mẫu 4 */}
        <div className="flex h-full items-center justify-center border-r border-[#F2D5B8] bg-[#F7D7B5] py-3 text-sm font-black text-[#243B53]">
          {rowIndex + 1}
        </div>

        {/* Tên PART */}
        <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#243B53]">
          {isCustom && (
            <span className="text-[#2878B8]">
              {isChecked ? (
                <CheckSquare className="h-4 w-4 text-[#2878B8]" />
              ) : (
                <Square className="h-4 w-4 text-[#718096]" />
              )}
            </span>
          )}
          <span className="font-semibold text-[#4A5568]">{part.title}</span>
          <span className="hidden text-xs text-[#718096] sm:inline">
            ({part.englishTitle})
          </span>
        </div>

        {/* Số câu hỏi */}
        <div className="border-l border-[#F2D5B8] px-4 py-3 text-sm font-medium text-[#4A5568]">
          {part.standardToeicCount} CÂU{' '}
          <span className="text-xs text-[#718096]">({part.questionCount} câu đề)</span>
        </div>
      </div>
    )
  }

  return (
    <div className="ec-reading-font min-h-screen bg-[#F5FAFE] pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-[#DCEAF3] bg-white py-2 text-xs text-[#718096]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link to="/" className="hover:text-[#2878B8] hover:underline">
              Trang chủ
            </Link>
            <span>»</span>
            <Link to="/test-online" className="hover:text-[#2878B8] hover:underline">
              Test Online
            </Link>
            <span>»</span>
            <span className="font-bold text-[#243B53]">{test?.title ?? slug}</span>
          </div>

          <Link
            to="/test-online"
            className="inline-flex items-center gap-1 font-extrabold text-[#2878B8] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Danh sách đề</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 lg:px-6">
        {loading && <LoadingBlock label="Đang tải cấu trúc đề thi..." />}

        {!loading && error && <ErrorBlock message={error} onRetry={retry} />}

        {!loading && !error && !test && (
          <EmptyBlock
            title="Không tìm thấy đề thi"
            description="Đề thi này không tồn tại hoặc đang được quản trị viên tạm ẩn."
          />
        )}

        {!loading && !error && test && (
          <div>
            {/* Hàng tiêu đề trên cùng: Tên đề bên trái - Lưu ý trình duyệt bên phải giống ảnh 4 */}
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-[#2878B8] sm:text-3xl">
                {test.title}
              </h1>
              <p className="text-xs italic text-[#4A5568] sm:text-sm">
                Lưu ý: Hãy sử dụng trình duyệt Google Chrome để làm Test
              </p>
            </div>

            {/* Khung trắng chính giống hệt ảnh 4 */}
            <div className="rounded-xl border border-[#DCEAF3] bg-white p-6 shadow-xs sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-[#4A5568] sm:text-base">
                  <p>
                    Thời gian làm bài thi:{' '}
                    <strong className="font-extrabold text-[#243B53]">
                      {selectedDuration === 120
                        ? '2 giờ'
                        : `${selectedDuration} phút`}
                    </strong>
                  </p>
                  <p className="mt-1">Cấu trúc đề thi</p>
                </div>

                {/* Nút chọn thời gian nhanh & kiểm tra loa gọn nhẹ */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <label className="flex items-center gap-1.5 font-semibold text-[#4A5568]">
                    <span>Thời gian:</span>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setUserDurationOverride(Number(e.target.value))}
                      className="rounded-lg border border-[#DCEAF3] bg-[#F5FAFE] px-2.5 py-1.5 font-extrabold text-[#243B53] outline-none focus:border-[#75BDEB]"
                    >
                      {test.availableDurationOptions.map((m) => (
                        <option key={m} value={m}>
                          {m === 120 ? '120 phút (2 giờ)' : `${m} phút`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={handleSpeakerTest}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#75BDEB] bg-[#EAF6FD] px-3 py-1.5 font-extrabold text-[#2878B8] transition hover:bg-[#2878B8] hover:text-white"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{testingSpeaker ? 'Đang phát...' : 'Thử loa'}</span>
                  </button>
                </div>
              </div>

              {/* Khối bảng Cấu trúc đề thi căn giữa giống ảnh 4 */}
              <div className="mx-auto mt-6 max-w-2xl">
                {/* Checkbox "Chọn từng part" */}
                <div className="mb-5 flex items-center justify-between">
                  <label className="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm font-extrabold text-[#243B53]">
                    <input
                      type="checkbox"
                      checked={practiceMode === 'custom_parts'}
                      onChange={handleToggleCustomMode}
                      className="h-4 w-4 accent-[#2878B8]"
                    />
                    <span>Chọn từng part</span>
                  </label>

                  {practiceMode === 'custom_parts' && (
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() =>
                          setCustomSelectedParts(test.parts.map((p) => p.partNumber))
                        }
                        className="text-[#2878B8] hover:underline"
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomSelectedParts([])}
                        className="text-[#718096] hover:text-rose-600 hover:underline"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  )}
                </div>

                {/* Bảng LISTENING */}
                <div>
                  <h2 className="mb-2.5 text-sm font-black uppercase tracking-wide text-[#243B53]">
                    LISTENING
                  </h2>
                  <div className="overflow-hidden border border-[#F2D5B8]">
                    {listeningParts.map((part, idx) => renderPartRow(part, idx))}
                  </div>
                </div>

                {/* Bảng READING */}
                <div className="mt-6">
                  <h2 className="mb-2.5 text-sm font-black uppercase tracking-wide text-[#243B53]">
                    READING
                  </h2>
                  <div className="overflow-hidden border border-[#F2D5B8]">
                    {readingParts.map((part, idx) => renderPartRow(part, idx))}
                  </div>
                </div>

                {startError && (
                  <div className="mt-4">
                    <ErrorBlock message={startError} />
                  </div>
                )}

                {!canStart && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Vui lòng tích chọn ít nhất 1 Part để bắt đầu làm bài.</span>
                  </div>
                )}

                {/* Nút BẮT ĐẦU LÀM BÀI */}
                <div className="mt-7 flex justify-center">
                  <button
                    type="button"
                    disabled={!canStart}
                    onClick={handleStartExam}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F26522] px-10 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-[#d95314] disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>{starting ? 'Đang mở đề...' : 'BẮT ĐẦU LÀM BÀI'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
