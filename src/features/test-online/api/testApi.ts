import { USE_MOCK_API } from '@/services/api/apiConfig'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { ApiClientError, httpClient } from '@/services/api/httpClient'
import { mockDelay } from '@/services/api/mockUtils'
import { mockTests } from '@/features/test-online/mocks/testMockData'
import type { Test } from '@/features/test-online/types/test.types'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export const testApi = {
  /**
   * Lấy danh sách đề thi công khai dành cho Học viên (Student Portal).
   */
  async getTests(): Promise<Test[]> {
    if (!USE_MOCK_API) {
      const list = await httpClient.get<Test[]>(API_ENDPOINTS.testOnline.testsList)
      return list.filter((t) => t.status === 'published')
    }
    await mockDelay(120)
    return clone(mockTests.filter((t) => t.status === 'published'))
  },

  /**
   * Lấy thông tin chi tiết đề thi theo slug.
   */
  async getTestBySlug(slug: string): Promise<Test | null> {
    if (!USE_MOCK_API) {
      try {
        return await httpClient.get<Test>(API_ENDPOINTS.testOnline.testDetailBySlug(slug))
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) return null
        throw err
      }
    }
    await mockDelay(120)
    const found = mockTests.find((t) => t.slug === slug && t.status === 'published')
    return found ? clone(found) : null
  },

  /**
   * Lấy thông tin đề thi theo testId (dùng trong phòng thi / trang kết quả).
   */
  async getTestById(testId: string): Promise<Test | null> {
    if (!USE_MOCK_API) {
      const list = await this.getTests()
      return list.find((t) => t.id === testId) ?? null
    }
    await mockDelay(60)
    const found = mockTests.find((t) => t.id === testId)
    return found ? clone(found) : null
  },
}
