# HỢP ĐỒNG GIAO TIẾP API FRONTEND – BACKEND (`FRONTEND_API_CONTRACT.md`)

> **Lưu ý quan trọng:** Toàn bộ các API dưới đây là hợp đồng giao tiếp giữa Frontend và Backend Node.js. Các endpoint đã được khai báo tập trung tại `src/services/api/endpoints.ts`. Hiện tại khi `USE_MOCK_API = true`, dữ liệu được cung cấp bởi tầng Mock Service/Repository. Khi Backend hoàn thành và bật `VITE_DATA_SOURCE=api`, Frontend sẽ gọi trực tiếp các endpoint này qua `httpClient`.

---

## 1. Chuẩn Hóa Cấu Trúc Response & Error

### 1.1. Response Thành Công
`httpClient` tại `src/services/api/httpClient.ts` tự động mở gói (unwrap) trường `data` nếu Backend trả về theo chuẩn Envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Thành công"
}
```

### 1.2. Response Lỗi Chuẩn
```json
{
  "success": false,
  "message": "Thông báo lỗi thân thiện hiển thị cho học viên",
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT",
    "details": {}
  }
}
```

---

## 2. Nhóm API Xác thực & Tài khoản (`API_ENDPOINTS.auth`)

| Method | Endpoint | Mục đích | Request Body / Params | Response Data | Auth | Quyền & Sở hữu | Lỗi cần xử lý |
|---|---|---|---|---|---|---|---|
| `POST` | `/auth/register` | Học viên tự đăng ký tài khoản | `{ fullName, username, email, phone, password }` | `AuthActionResponse` (`{ success, message, user }`) | Không | Luôn gán cố định `role: 'student'` | `400` Sai định dạng, `409` Trùng username/email |
| `POST` | `/auth/login` | Đăng nhập hệ thống | `{ identifier, password, rememberMe }` | `AuthActionResponse` + Set HttpOnly Cookie | Không | Mọi học viên có tài khoản hợp lệ | `401` Sai thông tin, `403` Tài khoản bị khóa |
| `POST` | `/auth/logout` | Đăng xuất & hủy phiên | `{}` | `{ success: true }` | Có | Phiên hiện tại | `200` Luôn xóa phiên Client |
| `GET` | `/auth/me` | Khôi phục thông tin phiên đăng nhập | — | `AuthUser` | Có | Chính học viên đang đăng nhập | `401` Phiên hết hạn |
| `POST` | `/auth/forgot-password` | Yêu cầu gửi email đặt lại mật khẩu | `{ email }` | `{ success: true, message }` | Không | Không tiết lộ email có tồn tại hay không | `429` Gửi quá nhiều lần |
| `POST` | `/auth/reset-password` | Đặt lại mật khẩu bằng token | `{ token, newPassword, confirmPassword }` | `{ success: true, message }` | Không | Người sở hữu token hợp lệ | `400` Token hết hạn/không hợp lệ |
| `POST` | `/auth/change-password` | Đổi mật khẩu khi đang đăng nhập | `{ currentPassword, newPassword, confirmPassword }` | `{ success: true, message }` | Có | Chính học viên đang đăng nhập | `400` Mật khẩu hiện tại sai |

---

## 3. Nhóm API Cổng Học Viên – Student Portal (`API_ENDPOINTS.studentPortal`)

| Method | Endpoint | Mục đích | Request Body / Params | Response Data | Auth | Quyền & Sở hữu | Lỗi cần xử lý |
|---|---|---|---|---|---|---|---|
| `GET` | `/students/me` | Lấy dữ liệu tổng hợp Cổng học viên (Hồ sơ, Lớp hiện tại, Kế hoạch 24 buổi, BTVN, Điểm danh, Kết quả Mid/Final, Yêu cầu hỗ trợ) | — | `StudentPortalDataset` | Có | `student` (chỉ trả dữ liệu của `req.user.id`) | `401` Chưa đăng nhập |
| `GET` | `/students/me/enrollments` | Lấy danh sách các lớp/khóa học mà học viên đã đăng ký | — | `StudentClassInfo[]` | Có | `student` (`studentId === req.user.id`) | `401` Chưa đăng nhập |
| `GET` | `/learning-plans/me` | Lấy kế hoạch học tập & tài liệu của lớp đang theo học | `?weekIndex=` | `{ generalResources, lessons }` | Có | Học viên thuộc lớp học đó | `403` Chưa xếp lớp |
| `GET` | `/assignments/me` | Lấy danh sách BTVN & Demo Test kèm trạng thái nộp của học viên | `?status=&keyword=` | `AssignmentWithSubmission[]` | Có | `student` (`studentId === req.user.id`) | `401` Chưa đăng nhập |
| `POST` | `/assignments/:assignmentId/submissions` | Nộp link Google Drive BTVN kèm số câu đúng LC/RC hoặc tự nhập điểm Demo Test | `{ submissionType: 'homework' \| 'demo', driveLink?, partScores?, demoScores? }` | `AssignmentSubmission` (trạng thái `'submitted'` – Chờ kiểm tra) | Có | `student` thuộc lớp được giao bài tập đó | `400` Link không phải Google Drive / Điểm ngoài khoảng `0..495`, `403` Bài đã được giáo viên chốt `'passed'` |
| `GET` | `/attendance/me` | Lấy lịch sử điểm danh của học viên | — | `AttendanceRecord[]` | Có | `student` (Read-only, chỉ xem của chính mình) | `401` Chưa đăng nhập |
| `GET` | `/exam-results/me` | Lấy kết quả thi đầu vào, Middle Test, Final Test và mục tiêu | — | `StudentExamResultsOverview` | Có | `student` (`studentId === req.user.id`) | `401` Chưa đăng nhập |
| `GET` | `/schedules/me` | Lấy thời khóa biểu lớp học và hạn nộp BTVN theo tuần | `?weekIndex=` | `{ classInfo, lessons, assignments }` | Có | `student` (`studentId === req.user.id`) | `401` Chưa đăng nhập |
| `GET` | `/support-requests/me` | Lấy lịch sử yêu cầu hỗ trợ học vụ đã gửi | — | `SupportRequestRecord[]` | Có | `student` (`studentId === req.user.id`) | `401` Chưa đăng nhập |
| `POST` | `/support-requests` | Gửi yêu cầu Học lại / Bảo lưu / Bảo lưu quay lại / Chuyển lớp | `{ type, reason, content, contact? }` | `SupportRequestRecord` (trạng thái `'pending'` – Chờ tiếp nhận) | Có | `student` (`studentId === req.user.id`) | `400` Thiếu lý do hoặc nội dung < 10 ký tự |

---

## 4. Nhóm API Study Zone (`API_ENDPOINTS.studyZone`)

| Method | Endpoint | Mục đích | Request Body / Params | Response Data | Auth | Quyền & Sở hữu | Lỗi cần xử lý |
|---|---|---|---|---|---|---|---|
| `GET` | `/public/study-zone/topics` | Danh sách chủ đề theo phân mục (`grammar` \| `vocabulary` \| `listening`) | `?category=` | `StudyTopic[]` (`isPublished: true`) | Không | Công khai | — |
| `GET` | `/public/study-zone/topics/:slug` | Chi tiết bài học lý thuyết, từ vựng và danh sách bài luyện tập | `?category=` | `StudyTopic` | Không | Công khai | `404` Không tồn tại hoặc chưa xuất bản |
| `GET` | `/public/study-zone/exercises/:exerciseId` | Lấy đề bài tập trắc nghiệm (**không chứa đáp án đúng**) | — | `StudyExercise` | Không | Công khai | `404` Không tìm thấy bài tập |
| `POST` | `/public/study-zone/exercises/:exerciseId/submit` | Nộp bài tập Study Zone và nhận kết quả chấm điểm + lời giải chi tiết | `{ exerciseId, answers, durationSeconds }` | `ExerciseAttemptResult` | Tùy chọn | Ghi nhận theo học viên nếu đã đăng nhập | `400` Dữ liệu đáp án không hợp lệ |

---

## 5. Nhóm API Test Online – Thi Thử TOEIC (`API_ENDPOINTS.testOnline`)

| Method | Endpoint | Mục đích | Request Body / Params | Response Data | Auth | Quyền & Sở hữu | Lỗi cần xử lý |
|---|---|---|---|---|---|---|---|
| `GET` | `/public/tests` | Danh sách đề thi TOEIC đang mở (`published`) | — | `Test[]` | Không | Công khai | — |
| `GET` | `/public/tests/:slug` | Chi tiết cấu trúc 7 Parts của đề thi (**không chứa `ServerTestAnswerKey`**) | — | `Test` | Không | Công khai | `404` Không tìm thấy đề thi |
| `POST` | `/public/test-attempts/start` | Khởi tạo lượt thi mới (`attemptId`, `startedAt`, `deadlineAt`) | `{ testId, testSlug, practiceMode, selectedParts, selectedDuration }` | `TestAttempt` | Tùy chọn | Gắn `studentId` của học viên đang đăng nhập | `404` Đề thi không tồn tại |
| `GET` | `/public/test-attempts/:attemptId` | Khôi phục trạng thái lượt thi khi tải lại trang | — | `TestAttempt` | Tùy chọn | Chỉ chủ sở hữu lượt thi | `403` Không phải lượt thi của bạn, `404` Không tồn tại |
| `POST` | `/public/test-attempts/:attemptId/progress` | Lưu đáp án, đánh dấu câu hỏi, khóa nhóm Audio Listening đã phát 1 lần, xác nhận qua màn hình giới thiệu Part | `{ answers?, flaggedQuestionIds?, audioGroupId?, status?, action?: 'confirm_part_intro', partNumber? }` | `TestAttempt` | Tùy chọn | Chỉ chủ sở hữu lượt thi khi `status === 'in_progress'` | `409` Lượt thi đã nộp hoặc nhóm Audio đã `LOCKED` |
| `POST` | `/public/test-attempts/:attemptId/submit` | Nộp bài thi chính thức hoặc thu bài tự động khi hết giờ | `{ reason: 'submitted' \| 'expired' }` | `TestAttemptResult` | Tùy chọn | Chỉ chủ sở hữu lượt thi | `409` Lượt thi đã được nộp trước đó |
| `GET` | `/public/test-attempts/:attemptId/result` | Xem kết quả chấm điểm và lời giải chi tiết sau khi đã nộp bài | — | `TestAttemptResult` | Tùy chọn | Chỉ trả về khi `attempt.status !== 'in_progress'` | `403` Lượt thi chưa nộp, `404` Không tìm thấy |
| `GET` | `/public/test-history` | Danh sách lịch sử các lượt làm bài của học viên hiện tại | `?keyword=&testSlug=&status=&fromDate=&toDate=&sortOrder=` | `TestHistoryRecord[]` | Tùy chọn | Chỉ trả các lượt thi có `studentId === req.user.id` | — |
| `GET` | `/public/test-history/:attemptId` | Xem lại chi tiết từng câu hỏi của một lượt thi trong lịch sử | — | `TestHistoryDetailPayload` | Tùy chọn | Chỉ chủ sở hữu lượt thi | `404` Không tìm thấy |

---

## 6. Nhóm API Website Công Khai (`courses`, `schedules`, `branches`, `news`, `articles`, `careers`, `consultations`)

| Method | Endpoint | Mục đích | Response Data |
|---|---|---|---|
| `GET` | `/public/courses` | Danh sách chương trình đào tạo công khai (`active`, `paused`) | `Course[]` |
| `GET` | `/public/courses/:slug` | Chi tiết khóa học theo `slug` | `Course \| null` |
| `GET` | `/public/branches` | Danh sách cơ sở đào tạo | `Branch[]` |
| `GET` | `/public/schedules` | Danh sách lịch khai giảng đã xuất bản (`isPublished: true`) | `Schedule[]` |
| `GET` | `/public/articles` | Danh sách bài viết Học viên / Tài liệu Listening-Reading / Review đề thi | `Article[]` |
| `GET` | `/public/articles/:slug` | Chi tiết bài viết kèm tài liệu đính kèm | `Article \| null` |
| `GET` | `/public/news` & `/public/news/:id` | Danh sách và chi tiết tin tức sự kiện | `NewsPost[]` / `NewsPost` |
| `GET` | `/public/careers` & `/public/careers/:id` | Danh sách và chi tiết tin tuyển dụng | `JobPosting[]` / `JobPosting` |
| `POST` | `/public/consultations` | Khách truy cập gửi biểu mẫu đăng ký tư vấn lộ trình | `ConsultationSubmitResult` |
