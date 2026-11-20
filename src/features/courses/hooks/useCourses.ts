import { useCallback } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { courseApi } from '@/features/courses/api/courseApi'

export function useCourses(options?: { featured?: boolean }) {
  const featured = options?.featured
  const queryKey = featured ? 'courses:featured' : 'courses:public'

  const fetcher = useCallback(() => courseApi.getPublicCourses({ featured }), [featured])

  return useAsync(fetcher, [featured], { queryKey })
}
