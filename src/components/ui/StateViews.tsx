import type { ReactNode } from 'react'
import { CircleAlert, LoaderCircle, Search } from 'lucide-react'

const box = 'flex flex-col items-center justify-center gap-2 rounded-xl border border-[#DCEAF3] bg-white px-4 py-14 text-center'

export function LoadingBlock({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className={box} role="status">
      <LoaderCircle className="h-8 w-8 animate-spin text-[#2878B8]" />
      <p className="text-sm text-[#718096]">{label}</p>
    </div>
  )
}

export function EmptyBlock({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className={box}>
      <Search className="h-8 w-8 text-[#75BDEB]" />
      <p className="font-bold text-[#243B53]">{title}</p>
      {description && <p className="text-sm text-[#718096]">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={box} role="alert">
      <CircleAlert className="h-8 w-8 text-[#F26522]" />
      <p className="font-bold text-[#243B53]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md bg-[#2878B8] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#1f5f94]"
        >
          Thử lại
        </button>
      )}
    </div>
  )
}
