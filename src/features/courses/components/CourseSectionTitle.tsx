interface CourseSectionTitleProps {
  children: string
  variant?: 'on-white' | 'on-blue'
}

/**
 * Khung tiêu đề kép có 2 vạch trang trí hai bên bám sát thiết kế mẫu của trang chi tiết khóa học
 */
export default function CourseSectionTitle({ children, variant = 'on-white' }: CourseSectionTitleProps) {
  const isBlueBg = variant === 'on-blue'

  return (
    <div className="inline-flex max-w-full items-center gap-2 sm:gap-3">
      <span
        aria-hidden="true"
        className={`hidden h-[3px] w-6 shrink-0 rounded-full sm:block sm:w-8 ${
          isBlueBg ? 'bg-[#67E8F9]' : 'bg-[#2878B8]'
        }`}
      />

      <div
        className={`rounded-sm border p-1 ${
          isBlueBg ? 'border-[#67E8F9]/80' : 'border-[#2878B8]/70'
        }`}
      >
        <h2
          className={`px-5 py-2 text-center text-lg font-extrabold uppercase tracking-wide sm:px-8 sm:py-2.5 sm:text-2xl ${
            isBlueBg
              ? 'bg-white text-[#1E40AF]'
              : 'bg-[#1E40AF] text-white'
          }`}
        >
          {children}
        </h2>
      </div>

      <span
        aria-hidden="true"
        className={`hidden h-[3px] w-6 shrink-0 rounded-full sm:block sm:w-8 ${
          isBlueBg ? 'bg-[#67E8F9]' : 'bg-[#2878B8]'
        }`}
      />
    </div>
  )
}
