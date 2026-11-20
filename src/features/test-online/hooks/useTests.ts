import { useCallback } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { testApi } from '@/features/test-online/api/testApi'

export function useTests() {
  const fetcher = useCallback(() => testApi.getTests(), [])
  return useAsync(fetcher, [], { queryKey: 'test-online:tests' })
}

export function useTestDetailBySlug(slug: string) {
  const fetcher = useCallback(() => testApi.getTestBySlug(slug), [slug])
  return useAsync(fetcher, [slug], {
    queryKey: `test-online:test-slug:${slug}`,
    enabled: Boolean(slug),
  })
}
