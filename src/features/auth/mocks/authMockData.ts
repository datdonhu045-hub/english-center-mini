import type { AuthUser } from '@/features/auth/types/auth.types'

/**
 * Danh sách tài khoản mẫu phục vụ phát triển và kiểm thử giao diện khi chưa có Backend Node.js.
 * - Tuyệt đối không lưu mật khẩu dạng văn bản thuần vào LocalStorage.
 * - Khi người dùng tự đăng ký trên website, hệ thống luôn gán cố định vai trò `student` (Học viên).
 */
export const initialMockUsers: AuthUser[] = [
  {
    id: 'stu-001',
    username: 'hocvien01',
    fullName: 'Đỗ Như Đạt',
    email: 'dat.donhu@student.englishcenter.edu.vn',
    phone: '0987654321',
    role: 'student',
    createdAt: '2026-09-15T08:00:00.000Z',
  },
  {
    id: 'stu-002',
    username: 'minhanh.toeic',
    fullName: 'Nguyễn Minh Anh',
    email: 'minhanh@student.englishcenter.edu.vn',
    phone: '0912345678',
    role: 'student',
    createdAt: '2026-10-02T09:30:00.000Z',
  },
]
