import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const base = 'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition'

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center gap-2 pt-4">
      <button
        type="button"
        aria-label="Trang trước"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={`${base} bg-white text-[#243B53] shadow-sm hover:bg-[#EAF6FD] disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
          className={`${base} ${p === page ? 'bg-[#2878B8] text-white shadow' : 'bg-white text-[#243B53] shadow-sm hover:bg-[#EAF6FD]'}`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        aria-label="Trang sau"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className={`${base} bg-white text-[#243B53] shadow-sm hover:bg-[#EAF6FD] disabled:opacity-40`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
