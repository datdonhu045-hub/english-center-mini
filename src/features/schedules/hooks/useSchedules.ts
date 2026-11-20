import { useCallback } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { scheduleApi } from '@/features/schedules/api/scheduleApi'
import type { ScheduleFilterParams } from '@/features/schedules/types'

export function useScheduleBranches() {
  return useAsync(scheduleApi.getBranches, [], { queryKey: 'branches:schedule' })
}

export function usePublicSchedules(filters: ScheduleFilterParams, enabled = true) {
  const { branchId, month, year, courseId } = filters
  const queryKey = `schedules:public:${branchId}:${month}:${year ?? 'all'}:${courseId ?? 'all'}`

  const fetcher = useCallback(async () => {
    if (!enabled || !branchId) return []
    return scheduleApi.getPublicSchedules({ branchId, month, year, courseId })
  }, [enabled, branchId, month, year, courseId])

  return useAsync(fetcher, [enabled, branchId, month, year, courseId], {
    queryKey,
    enabled: enabled && Boolean(branchId),
  })
}
