import { API_BASE_URL, API_CONFIG_ERROR } from '@/services/api/apiConfig'

export interface ApiEnvelope<T> {
  success?: boolean
  data: T
  message?: string
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>

const REQUEST_TIMEOUT_MS = 15_000

export class ApiClientError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status = 500, details?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.details = details
  }
}

function buildUrl(endpoint: string, params?: QueryParams): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url.toString()
}

function unwrapPayload<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data
  }
  return payload as T
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  options?: { params?: QueryParams; body?: unknown },
): Promise<T> {
  if (API_CONFIG_ERROR) {
    throw new ApiClientError(API_CONFIG_ERROR, 0)
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options?.body !== undefined) headers['Content-Type'] = 'application/json'

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(buildUrl(endpoint, options?.params), {
      method,
      headers,
      // Cho phép gửi/nhận HttpOnly Cookie xác thực khi kết nối Backend Node.js
      credentials: 'include',
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === 'AbortError'
    throw new ApiClientError(
      timedOut
        ? 'Máy chủ phản hồi quá chậm. Vui lòng thử lại.'
        : 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.',
      0,
      err,
    )
  } finally {
    window.clearTimeout(timer)
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const parsed: unknown = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const serverMessage =
      parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string'
        ? parsed.message
        : `Yêu cầu thất bại (Mã lỗi ${response.status})`
    throw new ApiClientError(serverMessage, response.status, parsed)
  }

  return unwrapPayload<T>(parsed)
}

export const httpClient = {
  get: <T>(endpoint: string, params?: QueryParams) => request<T>('GET', endpoint, { params }),
  post: <T>(endpoint: string, body?: unknown) => request<T>('POST', endpoint, { body }),
  patch: <T>(endpoint: string, body?: unknown) => request<T>('PATCH', endpoint, { body }),
  delete: <T>(endpoint: string, params?: QueryParams) => request<T>('DELETE', endpoint, { params }),
}
