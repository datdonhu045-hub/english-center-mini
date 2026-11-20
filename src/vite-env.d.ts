/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL gốc của Backend REST API, ví dụ: https://api.example.com/api/v1 */
  readonly VITE_API_BASE_URL?: string
  /** "true" để chạy bằng dữ liệu mẫu (chỉ nên dùng khi phát triển giao diện) */
  readonly VITE_USE_MOCK_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
