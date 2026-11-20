import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Headphones, Lock, Play, Volume2 } from 'lucide-react'
import SharedAudioPlayer from '@/features/study-zone/components/AudioPlayer'
import type { AudioPlaybackStatus } from '@/features/test-online/types/test.types'

interface TestAudioPlayerProps {
  audioGroupId: string
  src: string
  title?: string
  durationSeconds?: number
  status: AudioPlaybackStatus
  mode: 'exam_strict_once' | 'review'
  onPlayStarted?: (audioGroupId: string) => void
  onPlayCompleted?: (audioGroupId: string) => void
}

function formatSec(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const total = Math.floor(sec)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Trình phát Audio chuyên dụng cho Test Online:
 * 1. Ở chế độ `exam_strict_once` (trong khi đang thi Listening):
 *    - Mỗi nhóm Audio chỉ được phát MỘT LẦN DUY NHẤT.
 *    - Không cho phép tạm dừng (Pause), không cho phép tua lùi/tua tiến, không cho phép đổi tốc độ, không cho phép phát lại.
 *    - Quản lý theo `audioGroupId`: chuyển giữa các câu trong cùng một nhóm Part 3/Part 4 vẫn giữ nguyên tiến trình audio đang chạy.
 *    - Khi tải lại trang hoặc quay lại từ Reading, nếu trạng thái là `LOCKED` hoặc `COMPLETED` thì khóa hoàn toàn.
 *    - Nếu gặp lỗi kỹ thuật trước khi phát thành công, thông báo lỗi rõ ràng và không tự ý khóa lượt nghe.
 * 2. Ở chế độ `review` (sau khi đã nộp bài):
 *    - Sử dụng trình phát đầy đủ điều khiển để học viên nghe lại và đối chiếu Transcript.
 */
export default function TestAudioPlayer({
  audioGroupId,
  src,
  title = 'File ghi âm Listening',
  durationSeconds = 4,
  status,
  mode,
  onPlayStarted,
  onPlayCompleted,
}: TestAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSeconds)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [needsUserGesture, setNeedsUserGesture] = useState(false)

  const isLocked = status === 'LOCKED' || status === 'COMPLETED'

  // Tự động kích hoạt lượt phát 1 lần khi học viên vào nhóm câu hỏi Listening chưa phát
  useEffect(() => {
    if (mode !== 'exam_strict_once' || isLocked) return
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = 1

    const startPlayback = async () => {
      try {
        await audio.play()
        setNeedsUserGesture(false)
        onPlayStarted?.(audioGroupId)
      } catch {
        setNeedsUserGesture(true)
      }
    }

    if (status === 'NOT_PLAYED' || status === 'PLAYING') {
      void startPlayback()
    }
  }, [audioGroupId, isLocked, mode, onPlayStarted, status])

  // Ở chế độ Xem lại sau khi nộp bài: cho phép điều khiển tự do
  if (mode === 'review') {
    return (
      <SharedAudioPlayer
        src={src}
        title={`${title} (Chế độ xem lại sau khi nộp bài)`}
        defaultDurationSeconds={durationSeconds}
      />
    )
  }

  const handleManualStartOnce = async () => {
    if (isLocked) return
    const audio = audioRef.current
    if (!audio) return
    setAudioError(null)
    try {
      audio.playbackRate = 1
      await audio.play()
      setNeedsUserGesture(false)
      onPlayStarted?.(audioGroupId)
    } catch {
      setAudioError(
        'Không thể phát file ghi âm do lỗi kết nối hoặc thiết bị âm thanh. Lượt nghe của bạn chưa bị trừ, vui lòng thử lại.',
      )
    }
  }

  if (isLocked) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] px-4 py-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#718096]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCEAF3] text-[#243B53]">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <p className="font-extrabold text-[#243B53]">{title}</p>
            <p className="text-[11px] text-[#718096]">
              Đoạn ghi âm này đã sử dụng lượt phát 1 lần và đã bị khóa theo quy chế thi TOEIC.
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF6FD] px-3 py-1 font-extrabold text-[#2878B8]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Đã phát (LOCKED)</span>
        </span>
      </div>
    )
  }

  const effectiveDuration = duration > 0 ? duration : durationSeconds
  const progressPercent =
    effectiveDuration > 0 ? Math.min(100, Math.round((currentTime / effectiveDuration) * 100)) : 0

  return (
    <div className="rounded-xl border-2 border-[#75BDEB] bg-white p-4 shadow-xs">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration
          if (Number.isFinite(d) && d > 0) setDuration(d)
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onRateChange={(e) => {
          if (e.currentTarget.playbackRate !== 1) {
            e.currentTarget.playbackRate = 1
          }
        }}
        onError={() => {
          setAudioError(
            'Gặp sự cố kỹ thuật khi tải file ghi âm. Hệ thống chưa khóa lượt nghe này, vui lòng nhấn Phát để thử lại.',
          )
        }}
        onEnded={() => {
          onPlayCompleted?.(audioGroupId)
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2878B8] text-white">
            {status === 'PLAYING' && !needsUserGesture ? (
              <Volume2 className="h-4 w-4 animate-pulse" />
            ) : (
              <Headphones className="h-4 w-4" />
            )}
          </span>
          <div>
            <p className="text-xs font-extrabold text-[#243B53] sm:text-sm">{title}</p>
            <p className="text-[11px] font-semibold text-[#2878B8]">
              Quy định phòng thi: Chỉ phát 1 lần duy nhất • Không tua • Không tạm dừng
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#EAF6FD] px-3 py-1 font-mono text-xs font-extrabold text-[#2878B8]">
          {formatSec(currentTime)} / {formatSec(effectiveDuration)}
        </span>
      </div>

      {/* Thanh tiến trình chỉ đọc (không cho kéo tua) */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#EAF6FD]">
        <div
          className="h-full rounded-full bg-[#2878B8] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Nếu trình duyệt chặn autoplay khi vừa tải lại trang hoặc có lỗi kỹ thuật trước khi phát */}
      {(needsUserGesture || audioError) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#75BDEB] bg-[#EAF6FD]/70 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#243B53]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#2878B8]" />
            <span>
              {audioError ??
                'Nhấn nút bên phải để bắt đầu lượt phát 1 lần cho đoạn ghi âm này.'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleManualStartOnce}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2878B8] px-3.5 py-1.5 font-extrabold text-white shadow-2xs transition hover:bg-[#1e639c]"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Phát Audio (1 lần)</span>
          </button>
        </div>
      )}
    </div>
  )
}
