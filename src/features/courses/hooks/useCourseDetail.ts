import { useCallback } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { courseApi } from '@/features/courses/api/courseApi'

export function useCourseDetail(slug: string) {
  const fetcher = useCallback(() => courseApi.getPublicCourseBySlug(slug), [slug])

  return useAsync(fetcher, [slug], {
    queryKey: `courses:detail:${slug}`,
    enabled: Boolean(slug),
  })
}
