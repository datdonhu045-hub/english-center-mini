const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const rawUseMock = import.meta.env.VITE_USE_MOCK_API?.trim().toLowerCase()
const rawDataSource = import.meta.env.VITE_DATA_SOURCE?.trim().toLowerCase()

/** URL gốc của Backend Node.js REST API (ví dụ: "https://api.example.com/api/v1") */
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')

/**
 * Chỉ dùng dữ liệu mẫu khi:
 * - Đặt tường minh VITE_DATA_SOURCE=mock hoặc VITE_USE_MOCK_API=true, HOẶC
 * - Đang chạy `npm run dev` mà chưa khai báo VITE_API_BASE_URL (và không ép tắt mock).
 *
 * Bản build production KHÔNG BAO GIỜ tự rơi về dữ liệu mẫu trừ khi đặt tường minh.
 */
export const USE_MOCK_API =
  rawDataSource === 'mock' ||
  rawUseMock === 'true' ||
  (import.meta.env.DEV &&
    !API_BASE_URL &&
    rawUseMock !== 'false' &&
    rawDataSource !== 'api')

/** Có giá trị khi cấu hình sai (production nhưng thiếu API URL) -> hiển thị lỗi rõ ràng thay vì chạy sai âm thầm */
export const API_CONFIG_ERROR: string | null =
  !USE_MOCK_API && !API_BASE_URL
    ? 'Website chưa được cấu hình địa chỉ máy chủ dữ liệu (VITE_API_BASE_URL). Vui lòng liên hệ quản trị viên.'
    : null
