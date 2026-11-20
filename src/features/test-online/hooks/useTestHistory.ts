import { useCallback } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { historyApi } from '@/features/test-online/api/historyApi'
import type { TestHistoryFilterParams } from '@/features/test-online/types/test.types'

export function useTestHistory(filters?: TestHistoryFilterParams) {
  const keyword = filters?.keyword ?? ''
  const testSlug = filters?.testSlug ?? ''
  const status = filters?.status ?? 'all'
  const fromDate = filters?.fromDate ?? ''
  const toDate = filters?.toDate ?? ''
  const sortOrder = filters?.sortOrder ?? 'newest'

  const fetcher = useCallback(
    () =>
      historyApi.getHistory({
        keyword,
        testSlug,
        status,
        fromDate,
        toDate,
        sortOrder,
      }),
    [keyword, testSlug, status, fromDate, toDate, sortOrder],
  )

  return useAsync(fetcher, [keyword, testSlug, status, fromDate, toDate, sortOrder], {
    queryKey: `test-online:history:${keyword}:${testSlug}:${status}:${fromDate}:${toDate}:${sortOrder}`,
  })
}

export function useTestHistoryDetail(attemptId: string) {
  const fetcher = useCallback(() => historyApi.getHistoryDetail(attemptId), [attemptId])
  return useAsync(fetcher, [attemptId], {
    queryKey: `test-online:history-detail:${attemptId}`,
    enabled: Boolean(attemptId),
  })
}
