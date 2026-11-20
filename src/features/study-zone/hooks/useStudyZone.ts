import { useCallback } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { studyZoneApi } from '@/features/study-zone/api/studyZoneApi'
import type { StudyZoneCategory } from '@/features/study-zone/types'

export function useStudyTopics(category: StudyZoneCategory) {
  const fetcher = useCallback(() => studyZoneApi.getTopics(category), [category])
  return useAsync(fetcher, [category], { queryKey: `study-zone:topics:${category}` })
}

export function useStudyTopicDetail(slug: string, category: StudyZoneCategory) {
  const fetcher = useCallback(() => studyZoneApi.getTopicBySlug(slug, category), [slug, category])
  return useAsync(fetcher, [slug, category], {
    queryKey: `study-zone:topic:${category}:${slug}`,
    enabled: Boolean(slug),
  })
}

export function useStudyExercise(exerciseId: string) {
  const fetcher = useCallback(() => studyZoneApi.getExerciseById(exerciseId), [exerciseId])
  return useAsync(fetcher, [exerciseId], {
    queryKey: `study-zone:exercise:${exerciseId}`,
    enabled: Boolean(exerciseId),
  })
}
