export type UserRole = 'student' | 'staff' | 'admin'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: 'Học viên',
  staff: 'Nhân sự / Giáo vụ',
  admin: 'Quản trị viên',
}

/**
 * Thông tin phiên đăng nhập hiện tại của người dùng trên Frontend.
 * Tuyệt đối KHÔNG lưu mật khẩu ở bất kỳ đâu trong đối tượng này hoặc trong LocalStorage.
 */
export interface AuthUser {
  id: string
  username: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export interface LoginPayload {
  identifier: string // Tên đăng nhập hoặc Email
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  fullName: string
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token?: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthActionResponse {
  success: boolean
  message: string
  user?: AuthUser
}
