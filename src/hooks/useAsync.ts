import { useQuery } from '@tanstack/react-query'
import { ApiClientError } from '@/services/api/httpClient'

export interface UseQueryOptions {
  /** Khóa cache. Phải mã hóa đủ tham số của truy vấn (VD: `courses:detail:${slug}`) */
  queryKey: string
  enabled?: boolean
  staleTimeMs?: number
}

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError || err instanceof Error) {
    if (err.message) return err.message
  }
  return 'Không thể tải dữ liệu. Vui lòng thử lại.'
}

/**
 * Lớp bọc mỏng trên TanStack Query, giữ giao diện { data, loading, error, retry }
 * để các trang không phụ thuộc trực tiếp vào thư viện.
 * Cache dùng chung giữa các component, tự dedupe request trùng, tự lấy lại khi dữ liệu cũ.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], options: UseQueryOptions) {
  const query = useQuery<T, unknown>({
    queryKey: [options.queryKey, ...deps],
    queryFn: fn,
    enabled: options.enabled ?? true,
    staleTime: options.staleTimeMs,
  })

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.isError ? getErrorMessage(query.error) : null,
    retry: () => {
      void query.refetch()
    },
    refetch: () => {
      void query.refetch()
    },
  }
}
