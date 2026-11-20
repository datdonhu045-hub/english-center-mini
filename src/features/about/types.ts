export type BranchStudyMode = 'Online' | 'Offline'

export interface Branch {
  id: string
  name: string
  shortLabel: string // Nhãn ngắn gọn cho Tab lịch khai giảng & Footer (VD: "Cs. Hà Đông")
  address: string
  phone: string
  city: string
  district: string
  lat: number
  lng: number
  mapUrl?: string
  image?: string
  studyMode: BranchStudyMode
  isActive: boolean // Admin bật/tắt cơ sở
  showOnMap: boolean // Chỉ hiện cơ sở vật lý trên trang Bản đồ cơ sở (ẩn kênh Online thuần túy)
  showInSchedule: boolean // Hiện trên thanh Tab Lịch khai giảng
  displayOrder: number
}

export type BranchInput = Omit<Branch, 'id'>

export type PublishStatus = 'draft' | 'published'

export interface NewsPost {
  id: string
  title: string
  excerpt: string
  content: string[]
  category: string
  date: string // YYYY-MM-DD
  image: string
  status?: PublishStatus // không ghi = đã đăng
}

// Dữ liệu form admin gửi lên khi tạo/sửa bài
export type NewsInput = Omit<NewsPost, 'id'>

export type JobType = 'Toàn thời gian' | 'Bán thời gian'

export interface JobPost {
  id: string
  title: string
  excerpt: string
  position: string
  type: JobType
  salary: string
  location: string
  deadline: string // YYYY-MM-DD
  image: string
  description: string[]
  requirements: string[]
  benefits: string[]
  status?: PublishStatus // không ghi = đang tuyển (published)
}

export type JobInput = Omit<JobPost, 'id'>
