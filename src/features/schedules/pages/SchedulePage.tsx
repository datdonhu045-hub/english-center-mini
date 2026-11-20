import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import PageBanner from '@/components/ui/PageBanner'
import Pagination from '@/components/ui/Pagination'
import { ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useCourses } from '@/features/courses/hooks/useCourses'
import { paginate } from '@/utils/format'
import { usePublicSchedules, useScheduleBranches } from '@/features/schedules/hooks/useSchedules'
import BranchTabs from '@/features/schedules/components/BranchTabs'
import MonthSelector from '@/features/schedules/components/MonthSelector'
import ScheduleTable from '@/features/schedules/components/ScheduleTable'
import ScheduleEmptyState from '@/features/schedules/components/ScheduleEmptyState'
import ConsultationModal from '@/features/schedules/components/ConsultationModal'
import type { PublicScheduleItem } from '@/features/schedules/types'

const PAGE_SIZE = 8
const DEFAULT_MONTH = 1

export default function SchedulePage() {
  const branchesState = useScheduleBranches()
  const coursesState = useCourses()

  const branches = useMemo(() => branchesState.data ?? [], [branchesState.data])
  const courses = useMemo(() => coursesState.data ?? [], [coursesState.data])

  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<number>(DEFAULT_MONTH)
  const [page, setPage] = useState<number>(1)
  const [consultTarget, setConsultTarget] = useState<PublicScheduleItem | null>(null)

  // Khi chưa chọn tab cơ sở, mặc định lấy cơ sở đầu tiên trong danh sách
  const activeBranchId = selectedBranchId || branches[0]?.id || ''
  const activeBranch = branches.find((b) => b.id === activeBranchId)

  const schedulesState = usePublicSchedules(
    { branchId: activeBranchId, month: selectedMonth },
    Boolean(activeBranchId),
  )

  const schedules = useMemo(() => schedulesState.data ?? [], [schedulesState.data])
  const paged = useMemo(() => paginate(schedules, page, PAGE_SIZE), [schedules, page])
  const startIndex = (paged.page - 1) * PAGE_SIZE

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId)
    setPage(1)
  }

  const handleSelectMonth = (month: number) => {
    setSelectedMonth(month)
    setPage(1)
  }

  const isLoading = branchesState.loading || schedulesState.loading
  const errorMessage = branchesState.error ?? schedulesState.error

  return (
    <div className="ec-font bg-white pb-16">
      {/* Khu vực 1: Tái sử dụng PageBanner dùng chung của dự án */}
      <PageBanner
        title="LỊCH KHAI GIẢNG"
        subtitle="Cập nhật liên tục lịch khai giảng các lớp TOEIC Trực tuyến & Offline tại toàn bộ hệ thống cơ sở English Center."
        image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400"
      />

      {/* Khu vực 2: Nội dung chính mở rộng toàn bộ chiều rộng (Không có Sidebar bên phải) */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <h2 className="text-2xl font-bold tracking-tight text-[#222222] sm:text-[28px]">
            Lịch khai giảng
          </h2>

          {activeBranch && (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-[#EEF2FF] px-3.5 py-1 text-xs font-semibold text-[#293CF5] sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-[#293CF5]" />
              <span>
                {activeBranch.shortLabel} • Tháng {selectedMonth}
              </span>
            </div>
          )}
        </div>

        {/* Khung chứa chính giống hình tham khảo: Nền trắng, bo góc, viền mảnh & shadow nhẹ */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6">
          {/* Thanh Tab chọn cơ sở */}
          {branches.length > 0 && (
            <BranchTabs
              branches={branches}
              selectedBranchId={activeBranchId}
              onSelectBranch={handleSelectBranch}
            />
          )}

          {/* Thanh chọn tháng 1 -> 12 */}
          <MonthSelector selectedMonth={selectedMonth} onSelectMonth={handleSelectMonth} />

          {/* Các trạng thái Tải dữ liệu / Lỗi / Không có dữ liệu / Bảng lịch */}
          {isLoading && <LoadingBlock label="Đang tải lịch khai giảng..." />}

          {!isLoading && errorMessage && (
            <ErrorBlock
              message={errorMessage}
              onRetry={() => {
                branchesState.retry()
                schedulesState.retry()
              }}
            />
          )}

          {!isLoading && !errorMessage && schedules.length === 0 && (
            <ScheduleEmptyState
              branchLabel={activeBranch?.shortLabel}
              month={selectedMonth}
              onResetToDefault={
                selectedMonth !== DEFAULT_MONTH ? () => handleSelectMonth(DEFAULT_MONTH) : undefined
              }
            />
          )}

          {!isLoading && !errorMessage && paged.items.length > 0 && (
            <>
              <ScheduleTable
                items={paged.items}
                startIndex={startIndex}
                onConsultClick={(item) => setConsultTarget(item)}
              />

              <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg bg-[#F8FAFC] px-4 py-3 text-xs text-[#777777] sm:flex-row sm:items-center">
                <span className="flex items-center gap-1.5">
                  <Info className="h-4 w-4 shrink-0 text-[#FF851B]" />
                  Lịch học các lớp Cá nhân / Nhóm nhỏ có thể linh hoạt sắp xếp theo thời gian biểu của học viên.
                </span>
                {activeBranch && (
                  <span className="font-medium text-[#222222]">{activeBranch.address}</span>
                )}
              </div>

              <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} />
            </>
          )}
        </section>
      </main>

      {/* Modal Đăng ký nhận tư vấn theo lớp (dùng key để tự động khởi tạo mới dữ liệu mỗi khi đổi lớp) */}
      <ConsultationModal
        key={consultTarget?.id ?? 'closed'}
        open={Boolean(consultTarget)}
        schedule={consultTarget}
        branches={branches}
        courses={courses}
        onClose={() => setConsultTarget(null)}
      />
    </div>
  )
}
