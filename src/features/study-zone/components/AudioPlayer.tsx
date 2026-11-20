import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  title?: string
  defaultDurationSeconds?: number
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5]

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const total = Math.floor(sec)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Trình phát Audio tương tác cho Study Zone:
 * - Hỗ trợ Play/Pause, thanh tiến trình, thời gian hiện tại / tổng thời lượng, tua lùi/tiến 5s, bật/tắt âm lượng, chỉnh tốc độ phát.
 * - Tuyệt đối KHÔNG tự động phát (no autoplay) khi học viên mở trang hoặc chuyển câu hỏi.
 */
export default function AudioPlayer({
  src,
  title,
  defaultDurationSeconds = 0,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(defaultDurationSeconds)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [speedIndex, setSpeedIndex] = useState(1) // 1.0x

  // Khi đổi nguồn audio (chuyển câu hỏi), dừng phát và đưa về 0:00
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
  }, [src])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    try {
      await audio.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const handleSeek = (nextValue: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = nextValue
    setCurrentTime(nextValue)
  }

  const skipBy = (deltaSeconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    const target = Math.max(0, Math.min(duration || 0, audio.currentTime + deltaSeconds))
    audio.currentTime = target
    setCurrentTime(target)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    const nextMuted = !muted
    audio.muted = nextMuted
    setMuted(nextMuted)
  }

  const handleVolumeChange = (nextVolume: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = nextVolume
    setVolume(nextVolume)
    if (nextVolume > 0 && muted) {
      audio.muted = false
      setMuted(false)
    }
  }

  const cycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % SPEED_OPTIONS.length
    setSpeedIndex(nextIdx)
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEED_OPTIONS[nextIdx]
    }
  }

  const effectiveDuration = duration > 0 ? duration : defaultDurationSeconds

  return (
    <div className="rounded-xl border border-[#DCEAF3] bg-white p-3 shadow-xs">
      {title && (
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#718096]">
          <span>{title}</span>
          <span className="text-[11px] text-[#2878B8]">Nhấn Play để nghe</span>
        </div>
      )}

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration
          if (Number.isFinite(d) && d > 0) setDuration(d)
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onEnded={() => {
          setPlaying(false)
          setCurrentTime(0)
        }}
      />

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Tạm dừng' : 'Phát ghi âm'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2878B8] text-white shadow-xs transition hover:bg-[#1f5f94]"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </button>

        {/* Tua lùi / tiến 5s */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => skipBy(-5)}
            title="Tua lùi 5 giây"
            aria-label="Tua lùi 5 giây"
            className="rounded-md p-1.5 text-[#718096] transition hover:bg-[#EAF6FD] hover:text-[#2878B8]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => skipBy(5)}
            title="Tua tiến 5 giây"
            aria-label="Tua tiến 5 giây"
            className="rounded-md p-1.5 text-[#718096] transition hover:bg-[#EAF6FD] hover:text-[#2878B8]"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Thời gian hiện tại / Tổng thời lượng */}
        <span className="shrink-0 font-mono text-xs font-semibold text-[#243B53]">
          {formatSeconds(currentTime)} / {formatSeconds(effectiveDuration)}
        </span>

        {/* Thanh tiến trình */}
        <input
          type="range"
          min={0}
          max={effectiveDuration || 1}
          step={0.1}
          value={Math.min(currentTime, effectiveDuration || 1)}
          aria-label="Tiến trình âm thanh"
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="h-1.5 min-w-[90px] flex-1 cursor-pointer appearance-none rounded-lg bg-[#DCEAF3] accent-[#2878B8]"
        />

        {/* Điều chỉnh âm lượng */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Bật tiếng' : 'Tắt tiếng'}
            className="rounded-md p-1 text-[#718096] transition hover:text-[#2878B8]"
          >
            {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            aria-label="Âm lượng"
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="h-1 w-16 cursor-pointer appearance-none rounded-lg bg-[#DCEAF3] accent-[#2878B8]"
          />
        </div>

        {/* Tốc độ phát */}
        <button
          type="button"
          onClick={cycleSpeed}
          title="Đổi tốc độ phát"
          className="rounded-md border border-[#DCEAF3] bg-[#F5FAFE] px-2 py-1 text-xs font-bold text-[#243B53] transition hover:border-[#2878B8] hover:text-[#2878B8]"
        >
          {SPEED_OPTIONS[speedIndex]}x
        </button>
      </div>
    </div>
  )
}
