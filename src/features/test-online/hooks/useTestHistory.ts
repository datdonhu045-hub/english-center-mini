import { useCallback } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { historyApi } from '@/features/test-online/api/historyApi'
import type { TestHistoryFilterParams } from '@/features/test-online/types/test.types'

export function useTestHistory(filters?: TestHistoryFilterParams) {
  const { user } = useAuth()
  const studentScope = user?.id ?? 'guest'
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

  return useAsync(
    fetcher,
    [studentScope, keyword, testSlug, status, fromDate, toDate, sortOrder],
    {
      queryKey: `test-online:history:${studentScope}:${keyword}:${testSlug}:${status}:${fromDate}:${toDate}:${sortOrder}`,
    },
  )
}

export function useTestHistoryDetail(attemptId: string) {
  const fetcher = useCallback(() => historyApi.getHistoryDetail(attemptId), [attemptId])
  return useAsync(fetcher, [attemptId], {
    queryKey: `test-online:history-detail:${attemptId}`,
    enabled: Boolean(attemptId),
  })
}
