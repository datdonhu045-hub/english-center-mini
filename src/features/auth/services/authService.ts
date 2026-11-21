import { USE_MOCK_API } from '@/services/api/apiConfig'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { httpClient } from '@/services/api/httpClient'
import { mockDelay } from '@/services/api/mockUtils'
import { queryClient } from '@/services/api/queryClient'
import { initialMockUsers } from '@/features/auth/mocks/authMockData'
import type {
  AuthActionResponse,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/features/auth/types/auth.types'

const SESSION_STORAGE_KEY = 'ec_auth_session_user_v1'
const REGISTERED_USERS_STORAGE_KEY = 'ec_auth_registered_users_v1'

type AuthListener = () => void
const listeners = new Set<AuthListener>()

function notifyAuthListeners() {
  for (const listener of listeners) {
    listener()
  }
}

function readRegisteredUsers(): AuthUser[] {
  if (typeof window === 'undefined') return initialMockUsers
  try {
    const raw = window.localStorage.getItem(REGISTERED_USERS_STORAGE_KEY)
    if (!raw) return initialMockUsers
    const parsed = JSON.parse(raw) as AuthUser[]
    const map = new Map<string, AuthUser>()
    for (const u of initialMockUsers) map.set(u.id, u)
    for (const u of parsed) map.set(u.id, u)
    return Array.from(map.values())
  } catch {
    return initialMockUsers
  }
}

function saveRegisteredUsers(users: AuthUser[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users))
  } catch {
    // Bỏ qua nếu trình duyệt chặn LocalStorage
  }
}

export const authSessionStore = {
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    try {
      const raw =
        window.localStorage.getItem(SESSION_STORAGE_KEY) ??
        window.sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  setCurrentUser(user: AuthUser | null, rememberMe = true): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
      if (user) {
        const serialized = JSON.stringify(user)
        if (rememberMe) {
          window.localStorage.setItem(SESSION_STORAGE_KEY, serialized)
        } else {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, serialized)
        }
      }
    } catch {
      // Bỏ qua nếu trình duyệt chặn Storage
    }
    notifyAuthListeners()
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

/**
 * Các quy tắc kiểm tra dữ liệu đầu vào (Validation) cho toàn bộ hệ thống tài khoản.
 */
export const authValidators = {
  required(label: string, value: string): string {
    return value.trim() ? '' : `${label} không được để trống.`
  },
  email(value: string): string {
    const trimmed = value.trim()
    if (!trimmed) return 'Email không được để trống.'
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? '' : 'Email chưa đúng định dạng.'
  },
  username(value: string): string {
    const trimmed = value.trim()
    if (!trimmed) return 'Tên đăng nhập không được để trống.'
    return /^[a-zA-Z0-9._]{4,24}$/.test(trimmed)
      ? ''
      : 'Tên đăng nhập 4–24 ký tự, chỉ gồm chữ, số, dấu chấm hoặc gạch dưới.'
  },
  phone(value: string): string {
    const cleaned = value.replace(/\s+/g, '')
    if (!cleaned) return 'Số điện thoại không được để trống.'
    return /^(0|\+84)\d{9}$/.test(cleaned) ? '' : 'Số điện thoại chưa hợp lệ (VD: 0987654321).'
  },
  passwordStrength(value: string): string {
    if (!value) return 'Mật khẩu không được để trống.'
    if (value.length < 8 || !/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
      return 'Mật khẩu tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số.'
    }
    return ''
  },
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthActionResponse> {
    if (!USE_MOCK_API) {
      const res = await httpClient.post<AuthActionResponse>(API_ENDPOINTS.auth.login, payload)
      if (res.user) {
        authSessionStore.setCurrentUser(res.user, payload.rememberMe ?? true)
      }
      return res
    }

    await mockDelay(450)
    const identifier = payload.identifier.trim().toLowerCase()
    const users = readRegisteredUsers()

    // Tìm trong danh sách học viên đã có hoặc tạo phiên học viên khớp với thông tin đăng nhập
    let matched = users.find(
      (u) => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier,
    )

    if (!matched) {
      // Để thuận tiện kiểm thử giao diện như bản mẫu: nếu nhập đúng định dạng vẫn cho đăng nhập với tài khoản Học viên mặc định (stu-001) kèm tên hiển thị theo identifier
      const baseStudent = initialMockUsers[0]
      const isEmail = identifier.includes('@')
      const displayUsername = isEmail ? identifier.split('@')[0] : payload.identifier.trim()
      matched = {
        ...baseStudent,
        username: displayUsername,
        fullName:
          identifier === 'hocvien01' || identifier === baseStudent.email
            ? baseStudent.fullName
            : displayUsername,
        email: isEmail ? identifier : `${displayUsername}@student.hmctoeic.edu.vn`,
        role: 'student',
      }
    }

    authSessionStore.setCurrentUser(matched, payload.rememberMe ?? true)
    return {
      success: true,
      message: 'Đăng nhập thành công.',
      user: matched,
    }
  },

  /**
   * Đăng ký tài khoản mới.
   * Quy tắc nghiệp vụ bắt buộc:
   * - Người dùng tự đăng ký CHỈ được tạo tài khoản với vai trò `student` (Học viên).
   * - Việc tạo tài khoản KHÔNG tự động xếp lớp hay đăng ký khóa học cho học viên.
   */
  async register(payload: RegisterPayload): Promise<AuthActionResponse> {
    if (!USE_MOCK_API) {
      return httpClient.post<AuthActionResponse>(API_ENDPOINTS.auth.register, {
        fullName: payload.fullName.trim(),
        username: payload.username.trim(),
        email: payload.email.trim(),
        phone: payload.phone.replace(/\s+/g, ''),
        password: payload.password,
      })
    }

    await mockDelay(550)
    const users = readRegisteredUsers()
    const usernameLower = payload.username.trim().toLowerCase()
    const emailLower = payload.email.trim().toLowerCase()

    if (users.some((u) => u.username.toLowerCase() === usernameLower)) {
      throw new Error('Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên đăng nhập khác.')
    }
    if (users.some((u) => u.email.toLowerCase() === emailLower)) {
      throw new Error('Địa chỉ email này đã được đăng ký trong hệ thống.')
    }

    const newUser: AuthUser = {
      id: `stu-${Date.now()}`,
      username: payload.username.trim(),
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      phone: payload.phone.replace(/\s+/g, ''),
      role: 'student', // Luôn cố định là Học viên
      createdAt: new Date().toISOString(),
    }

    saveRegisteredUsers([...users, newUser])
    return {
      success: true,
      message:
        'Đăng ký tài khoản Học viên thành công! Bạn có thể đăng nhập ngay ở khung bên trái để bắt đầu sử dụng hệ thống.',
      user: newUser,
    }
  },

  /**
   * Yêu cầu đặt lại mật khẩu qua Email.
   * Quy tắc bảo mật: Luôn trả về cùng một thông báo chuẩn, không tiết lộ email có tồn tại trong hệ thống hay không.
   */
  async requestPasswordReset(payload: ForgotPasswordPayload): Promise<AuthActionResponse> {
    if (!USE_MOCK_API) {
      return httpClient.post<AuthActionResponse>(API_ENDPOINTS.auth.forgotPassword, payload)
    }

    await mockDelay(550)
    return {
      success: true,
      message:
        'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến địa chỉ email của bạn.',
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<AuthActionResponse> {
    if (!USE_MOCK_API) {
      return httpClient.post<AuthActionResponse>(API_ENDPOINTS.auth.resetPassword, payload)
    }

    await mockDelay(500)
    return {
      success: true,
      message:
        'Đặt lại mật khẩu mới thành công. Khi kết nối Backend, liên kết token từ email sẽ được xác thực tại máy chủ.',
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<AuthActionResponse> {
    if (!USE_MOCK_API) {
      return httpClient.post<AuthActionResponse>(API_ENDPOINTS.auth.changePassword, payload)
    }

    await mockDelay(500)
    if (payload.currentPassword === payload.newPassword) {
      throw new Error('Mật khẩu mới phải khác với mật khẩu hiện tại.')
    }
    return {
      success: true,
      message: 'Cập nhật mật khẩu thành công.',
    }
  },

  async logout(): Promise<void> {
    if (!USE_MOCK_API) {
      try {
        await httpClient.post(API_ENDPOINTS.auth.logout, {})
      } catch {
        // Vẫn xóa phiên cục bộ nếu lỗi mạng
      }
    }
    await mockDelay(150)
    authSessionStore.setCurrentUser(null)
    // Xóa toàn bộ cache TanStack Query để không lộ dữ liệu học viên cũ cho phiên đăng nhập tiếp theo
    queryClient.clear()
  },
}
