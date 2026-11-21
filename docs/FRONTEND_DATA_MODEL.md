# MÔ HÌNH DỮ LIỆU & QUAN HỆ NGHIỆP VỤ FRONTEND (`FRONTEND_DATA_MODEL.md`)

Tài liệu này định nghĩa sơ đồ quan hệ thực thể (Domain Entities) đang sử dụng thống nhất trên toàn bộ Frontend HMC TOEIC để đội ngũ Backend Node.js đối chiếu khi thiết kế Database Schema.

---

## 1. Sơ đồ Quan hệ Thực thể Tổng thể

```text
AuthUser (1) ────── (1) StudentProfile
                         │
                         ├──── (0..N) Enrollment ────> (1) StudentClassInfo ────> (1) Course
                         │                                      │
                         │                                      ├──── (1..N) LessonSession (24 buổi)
                         │                                      │               ├── (0..N) LearningResource
                         │                                      │               └── (0..1) AssignmentItem
                         │                                      │
                         ├──── (0..N) AssignmentSubmission ─────┴──────────────────────────┘
                         ├──── (0..N) AttendanceRecord (gắn với LessonSession)
                         ├──── (0..N) OfficialExamRecord (Middle Test & Final Test)
                         ├──── (0..N) SupportRequestRecord (Học lại / Bảo lưu / Chuyển lớp)
                         └──── (0..N) TestAttempt ────> (0..1) TestAttemptResult (Test Online)
```

---

## 2. Chi Tiết Các Thực Thể Nghiệp Vụ (Domain Models)

### 2.1. Tài khoản & Hồ sơ Học viên (`AuthUser` & `StudentProfile`)
- **`AuthUser`** (`src/features/auth/types/auth.types.ts`):
  - `id: string` (VD: `'stu-001'`, `'stu-002'`)
  - `username: string`
  - `fullName: string`
  - `email: string`
  - `phone: string`
  - `role: 'student' | 'staff' | 'admin'` (Tự đăng ký luôn cố định là `'student'`)
  - `createdAt: string` (ISO 8601)
- **`StudentProfile`** (`src/features/student-portal/model/studentPortal.types.ts`):
  - `id: string` (Khớp 1-1 với `AuthUser.id`)
  - `studentCode: string` (VD: `'HV-2026-001'`)
  - `entryScore: { lc: number; rc: number; total: number }`
  - `goalScore: { lc: number; rc: number; total: number }`

### 2.2. Khóa học, Lớp học & Buổi học (`Course`, `StudentClassInfo`, `LessonSession`)
- **`Course`** (`src/features/courses/types.ts`):
  - `id: string` (VD: `'foundation-toeic'`, `'beginners-toeic'`, `'camp-bomb-toeic'`, `'submarine-toeic'`)
  - `slug: string`, `code: string`, `name: string`, `targetScore: string`, `status: 'active' | 'paused' | 'draft' | 'archived'`
- **`StudentClassInfo`** (`src/features/student-portal/model/studentPortal.types.ts`):
  - `id: string` (VD: `'cls-hmc-s01'`)
  - `classCode: string` (VD: `'HMC-S01'`)
  - `courseId: string` (Tham chiếu `Course.id`, VD: `'submarine-toeic'`)
  - `courseName: string`, `teacherName: string`, `branchName: string`
  - `scheduleDays: string`, `scheduleTime: string`, `roomName: string`
  - `startDate: string` (YYYY-MM-DD), `endDate: string` (YYYY-MM-DD)
  - `totalWeeks: number`, `totalSessions: number`
- **`LessonSession`**:
  - `id: string` (`'les-01'` .. `'les-24'`)
  - `learningPlanId: string`
  - `sessionNumber: number` (`1..24`), `weekIndex: number` (`0..7`)
  - `date: string` (YYYY-MM-DD)
  - `type: 'class' | 'review' | 'demo' | 'mid' | 'final'`
  - `title: string`, `lcContent: string`, `rcContent: string`
  - `resources: LearningResource[]`
  - `assignmentId?: string`

### 2.3. Bài tập, Bài nộp & Điểm danh (`AssignmentItem`, `AssignmentSubmission`, `AttendanceRecord`)
- **`AssignmentItem`**:
  - `id: string` (`'B01'` cho BTVN hoặc `'D11'` cho Demo Test)
  - `lessonId: string`, `sessionNumber: number`, `weekIndex: number`
  - `code: string`, `title: string`, `assignedDate: string`, `dueDate: string` (ISO 8601, hạn 23:00)
  - `isDemoTest: boolean`
  - `parts: Array<{ key: 'lc' | 'rc'; label: string; maxQuestions: number }> | null`
- **`AssignmentSubmission`** (Tách biệt khỏi `AssignmentItem`):
  - `assignmentId: string`, `studentId: string`
  - `status: 'todo' | 'submitted' | 'passed' | 'failed'`
  - `driveLink?: string` (Chỉ nhận `https://drive.google.com/...` hoặc `https://docs.google.com/...`)
  - `partScores?: { lc: number; rc: number }`
  - `demoScores?: { lc: number; rc: number; total: number }`
  - `isConfirmedByTeacher?: boolean` (Phân biệt rõ điểm học viên tự nhập đang chờ kiểm tra với điểm giáo viên đã xác nhận)
  - `teacherComment?: string`, `submittedAt?: string`
- **`AttendanceRecord`**:
  - `id: string`, `lessonId: string`, `sessionNumber: number`, `date: string`
  - `status: 'on' | 'late' | 'excused' | 'absent' | 'none'` (Do giáo viên ghi nhận, học viên chỉ đọc)

### 2.4. Kết quả Thi Mid/Final & Yêu cầu Hỗ trợ (`OfficialExamRecord`, `SupportRequestRecord`)
- **`OfficialExamRecord`**:
  - `id: string`, `examType: 'mid' | 'final'`, `examDate: string`
  - `lcScore: number`, `rcScore: number`, `totalScore: number`, `isConfirmed: boolean`
  - `parts: Record<'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7s' | 'p7d' | 'p7t', { correct: number; total: number }>`
- **`SupportRequestRecord`**:
  - `id: string`, `studentId: string`
  - `type: 'retake' | 'hold' | 'resume' | 'transfer'`
  - `reason: string`, `content: string`, `contact?: string`, `createdAt: string`
  - `status: 'pending' | 'processing' | 'resolved'`

### 2.5. Đề thi, Lượt thi & Kết quả Test Online (`Test`, `TestAttempt`, `TestAttemptResult`)
- **`Test`** (`src/features/test-online/types/test.types.ts`):
  - Chứa thông tin đề thi và 7 `TestPart` -> `QuestionGroup` -> `TestQuestion` (**không chứa đáp án đúng**).
- **`TestAttempt`**:
  - `id: string` (`'ATT-YYYYMMDD-XXX'`), `studentId?: string`, `testId: string`, `testSlug: string`
  - `practiceMode: 'full' | 'custom_parts'`, `selectedParts: ToeicPartNumber[]`, `selectedDuration: number`
  - `startedAt: string`, `deadlineAt: string`, `timerPausedAt?: string`, `submittedAt?: string`
  - `status: 'in_progress' | 'submitted' | 'expired'`
  - `answers: Record<string, string>`, `flaggedQuestionIds: string[]`
  - `audioStates: Record<string, AudioGroupState>` (Quản lý trạng thái phát 1 lần của từng nhóm Audio Listening)
  - `introducedParts: ToeicPartNumber[]`, `currentPartNumber: ToeicPartNumber`, `currentStage: 'part_intro' | 'questions'`, `listeningCompleted: boolean`
- **`TestAttemptResult`**:
  - Chỉ được tạo sau khi lượt thi chuyển sang `'submitted'` hoặc `'expired'`, chứa thống kê điểm quy đổi, thống kê từng Part và `reviews` (đáp án đúng + giải thích + transcript).
