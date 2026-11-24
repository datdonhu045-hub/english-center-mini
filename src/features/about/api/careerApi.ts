import { USE_MOCK_API } from '@/services/api/apiConfig'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { ApiClientError, httpClient } from '@/services/api/httpClient'
import { mockDelay } from '@/services/api/mockUtils'
import type { JobPost } from '@/features/about/types'

const isPubliclyVisibleJob = (j: JobPost) => {
  const st = j.status ?? 'published'
  return st === 'published' || st === 'closed'
}

export const careerApi = {
  async getPublicJobs(): Promise<JobPost[]> {
    if (!USE_MOCK_API) {
      const list = await httpClient.get<JobPost[]>(API_ENDPOINTS.careers.publicList)
      return list.filter(isPubliclyVisibleJob)
    }

    await mockDelay()
    const { jobPosts } = await import('@/features/about/mocks/jobs')
    return jobPosts.filter(isPubliclyVisibleJob)
  },

  async getPublicJobById(id: string): Promise<JobPost | null> {
    if (!USE_MOCK_API) {
      try {
        const job = await httpClient.get<JobPost | null>(API_ENDPOINTS.careers.publicDetail(id))
        return job && isPubliclyVisibleJob(job) ? job : null
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) return null
        throw err
      }
    }

    await mockDelay(150)
    const { jobPosts } = await import('@/features/about/mocks/jobs')
    return jobPosts.find((j) => j.id === id && isPubliclyVisibleJob(j)) ?? null
  },
}
