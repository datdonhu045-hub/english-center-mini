# BÁO CÁO KIỂM ĐỊNH TOÀN DIỆN FRONTEND – HMC TOEIC (`FRONTEND_AUDIT_REPORT.md`)

**Ngày thực hiện Audit:** 22/11/2026  
**Phạm vi kiểm định:** Toàn bộ Frontend học viên và khách truy cập (`Public Website`, `Student Portal`, `Study Zone`, `Test Online`, `Authentication & Account`).

---

## 1. Tổng quan Dự án & Công nghệ

- **Tên hệ thống:** HMC TOEIC (*"Chỉ cần cố gắng - Học là đỗ"*)
- **Ngăn xếp công nghệ thực tế (`package.json`):**
  - **Core:** React `19.3.1`, TypeScript `~7.0.2`, Vite `8.3.6`
  - **Styling & Icons:** Tailwind CSS `4.3.5` (`@tailwindcss/vite`), Lucide React `1.73.0`
  - **Routing & Server State:** React Router DOM `7.18.5`, TanStack React Query `5.108.0`
  - **Linter:** `oxlint` `1.90.0` (116 rules, bao gồm React Compiler & React Hooks lints)
- **Đánh giá phụ thuộc (`dependencies`):** Bộ thư viện rất gọn, không có thư viện thừa hay trùng lặp chức năng. Thay vì cài thêm Axios, dự án đã xây dựng `httpClient` chuẩn hóa dựa trên native `fetch` + `AbortController` tại `src/services/api/httpClient.ts`.

---

## 2. Đánh giá Kiến trúc Hiện tại

### 2.1. Cấu trúc phân khu (3 Khu vực độc lập)
1. **Khu vực A – Public Website (`PublicLayout`)**:
   - Trang chủ (`/`), Lịch khai giảng (`/schedule`), Chương trình học (`/courses`, `/courses/:slug`), Học viên điểm cao (`/hoc-vien`), Tài liệu học tập (`/tai-lieu/listening-reading`, `/tai-lieu/review-de-thi`), Về chúng tôi (`/about/branches`, `/about/news`, `/about/careers`), Liên hệ (`/contact`) và Form Đăng ký tư vấn (`ConsultationForm`).
2. **Khu vực B – Student Portal & Hệ thống Tài khoản (`StudentLayout` & `auth`)**:
   - Hệ thống tài khoản: Đăng nhập (`/login`), Đăng ký (`/register`), Quên mật khẩu (`/forgot-password`), Đặt lại mật khẩu (`/reset-password`), Đổi mật khẩu (`/change-password`), Menu tài khoản (`UserAccountDropdown`), Modal xác nhận đăng xuất (`LogoutConfirmModal`).
   - Cổng học viên (`/student/*`): 5 phân hệ chuẩn với Top Navigation (`Trang chủ`, `Tài liệu & Kế hoạch học tập`, `Nộp bài & Điền điểm`, `Kết quả thi Mid & Final`, `Thời khóa biểu`).
3. **Khu vực C – Study Zone & Test Online**:
   - **Study Zone (`/study-zone/*`)**: 3 danh mục (`Ngữ pháp`, `Từ vựng`, `Luyện nghe`), chi tiết bài học lý thuyết, và phòng luyện tập trắc nghiệm toàn màn hình (`/study-zone/practice/:exerciseId`).
   - **Test Online (`/test-online/*`)**: Danh sách đề thi, cấu hình chọn Part/thời gian, phòng thi TOEIC toàn màn hình (`/test-online/attempt/:attemptId`), trang kết quả (`/test-online/result/:attemptId`) và lịch sử làm bài (`/test-history`, `/student/history`).

### 2.2. Điểm mạnh (Strengths)
- **Tách biệt giao diện thi cử toàn màn hình:** Các route làm bài `/test-online/attempt/:attemptId` và `/study-zone/practice/:exerciseId` được tách khỏi `PublicLayout` (không chứa Header/Footer gây xao nhãng), tự động cuộn lên đầu trang khi chuyển câu và thu gọn bảng điều hướng câu hỏi lên góc phải.
- **Bảo mật đáp án (Zero Answer-Key Leakage):** Trong cả `Study Zone` và `Test Online`, đối tượng câu hỏi gửi xuống UI khi đang làm bài hoàn toàn không chứa `correctOptionId` hay `explanation`. Việc chấm điểm chỉ diễn ra khi nộp bài.
- **Quy tắc thi TOEIC chặt chẽ:** Màn hình giới thiệu từng Part tự động tạm dừng đồng hồ đếm ngược và bù thời gian vào `deadlineAt` khi nhấn *"Bắt đầu Part"*; Audio Listening chỉ nghe 1 lần (`NOT_PLAYED -> PLAYING -> LOCKED`), khóa chuyển sang Reading khi chưa hoàn thành Listening.
- **Không dùng `dangerouslySetInnerHTML`:** Toàn bộ nội dung bài viết, câu hỏi, đoạn văn TOEIC được render qua cấu trúc dữ liệu `ContentBlock` an toàn kết hợp bộ lọc URL `toSafeHttpUrl` / `toSafeEmbedUrl`, loại bỏ nguy cơ XSS.

---

## 3. Các Vấn đề Phát hiện & Đã Khắc phục trong Đợt Audit

| Mã lỗi | Mức độ | Mô tả vấn đề phát hiện | Nguyên nhân | Trạng thái xử lý |
|---|---|---|---|---|
| **BUG-01** | **P0 – Critical** | Cache dữ liệu học viên trong `TanStack Query` không được xóa khi đăng xuất (`logout`), có nguy cơ hiển thị dữ liệu cũ nếu đăng nhập tài khoản khác ngay trên cùng tab. | `authService.logout()` chỉ xóa `authSessionStore` mà chưa gọi `queryClient.clear()`. | **Đã sửa** tại `src/features/auth/services/authService.ts`. |
| **BUG-02** | **P0 – Critical** | Lịch sử lượt thi (`TestAttempt`) trong `Test Online` chưa gắn `studentId` và chưa lọc theo tài khoản học viên đang đăng nhập. | `attemptService.ts` lưu chung map trong `localStorage` mà chưa gắn trường `studentId`. | **Đã sửa** tại `test.types.ts`, `attemptService.ts`, `historyApi.ts` và `useTestHistory.ts`. |
| **BUG-03** | **P1 – High** | Khi thoát khỏi phòng thi `Test Online` hoặc bài tập `Study Zone` lần đầu tiên, người dùng phải bấm nút xác nhận *"Thoát bài làm"* 2 lần mới thoát được. | `useBlocker` đọc React state bất đồng bộ trước khi `navigate()` hoàn tất. | **Đã sửa** bằng `allowLeaveRef = useRef(false)` đồng bộ tại `TestTakingPage.tsx` và `StudyExercisePage.tsx`. |
| **BUG-04** | **P1 – High** | `attemptApi.confirmPartIntroduction` chỉ mới cập nhật `attemptStorageService` (Mock) mà thiếu nhánh gọi `httpClient.post` khi `USE_MOCK_API = false`. | Thiếu nhánh `!USE_MOCK_API` trong hàm xác nhận màn hình giới thiệu Part. | **Đã sửa** tại `src/features/test-online/api/attemptApi.ts`. |
| **BUG-05** | **P1 – High** | `historyApi.getHistory(params)` ở chế độ API thật (`!USE_MOCK_API`) chưa truyền `params` bộ lọc (`testSlug`, `status`, `fromDate`, `toDate`) lên query string. | `httpClient.get` chỉ được truyền URL mà thiếu đối số `params`. | **Đã sửa** tại `src/features/test-online/api/historyApi.ts`. |
| **BUG-06** | **P2 – Medium** | `httpClient.ts` mới chỉ hỗ trợ `GET` và `POST`, đồng thời cố định `credentials: 'omit'`. | Giai đoạn đầu chỉ xây dựng cho Public Website. | **Đã nâng cấp** hỗ trợ `GET`, `POST`, `PATCH`, `DELETE` và `credentials: 'include'` tại `src/services/api/httpClient.ts`. |
| **BUG-07** | **P2 – Medium** | `courseId` trong dữ liệu lớp học của Student Portal dùng `'crs-submarine-700'` chưa khớp với `id: 'submarine-toeic'` của danh mục khóa học công khai. | Khác quy ước đặt ID giữa 2 file mock. | **Đã chuẩn hóa** về `'submarine-toeic'` tại `studentPortalMockData.ts`. |

---

## 4. Đánh giá 10 Câu hỏi Kết luận Nghiệm thu

1. **Frontend hiện tại đạt mức độ nào?**
   - Đạt mức **Production-Ready UI & Backend-Ready Architecture** cho phạm vi Khách truy cập và Học viên. Toàn bộ 183 files vượt qua `oxlint` và `tsc -b && vite build` với **0 lỗi, 0 cảnh báo**.
2. **Những phần nào đã đủ tốt?**
   - Kiến trúc phân tách 3 khu vực (`PublicLayout`, `StudentLayout`, Phòng thi độc lập), hệ thống `Test Online` chuẩn cấu trúc ETS 7 Parts, `Study Zone`, `Student Portal` 5 phân hệ và hệ thống `Authentication`.
3. **Những phần nào cần sửa ngay?**
   - Toàn bộ 7 vấn đề P0, P1, P2 phát hiện trong đợt Audit (cô lập cache khi logout, cô lập lịch sử thi theo `studentId`, nhánh API cho `confirmPartIntroduction`, truyền query params cho `historyApi`, mở rộng `httpClient`) **đã được sửa dứt điểm ngay trong phiên này**.
4. **Những phần nào chưa được triển khai (ngoài phạm vi hoặc chờ Backend)?**
   - `Management Portal / Admin Portal` (dành cho Admin, Giáo vụ, Giảng viên, Sale, Kế toán) — nằm ngoài phạm vi Frontend học viên.
   - Hệ thống thông báo đẩy thời gian thực (WebSocket/Push Notifications) và Upload file nhị phân trực tiếp lên Cloud Storage (hiện học viên nộp bài qua liên kết Google Drive/Docs theo đúng quy trình nghiệp vụ của trung tâm).
5. **Những phần nào đang sử dụng Mock Data?**
   - Toàn bộ các tính năng đọc/ghi dữ liệu hiện chạy qua tầng `Mock Service / Mock Repository` khi `USE_MOCK_API = true` và lưu trạng thái tương tác tạm thời trong `localStorage` để kiểm thử đầy đủ luồng người dùng.
6. **Kiến trúc hiện tại có phù hợp để tích hợp Backend Node.js không?**
   - **Hoàn toàn phù hợp.** Không có bất kỳ Component nào gọi thẳng HTTP request hoặc phụ thuộc cứng vào file Mock. Chỉ cần cấu hình `VITE_API_BASE_URL` và `VITE_DATA_SOURCE=api`, toàn bộ ứng dụng sẽ chuyển sang gọi REST API thật qua `httpClient`.
7. **Những API nào Backend cần xây dựng?**
   - Đã được liệt kê đầy đủ kèm Method, Endpoint, Request/Response, Auth và Error Cases trong [FRONTEND_API_CONTRACT.md](file:///d:/Web/english-center-mini/docs/FRONTEND_API_CONTRACT.md).
8. **Dữ liệu nào cần thống nhất giữa Frontend và Backend?**
   - Các thực thể `User`, `StudentProfile`, `Course`, `Class`, `Enrollment`, `LessonSession`, `Assignment`, `AssignmentSubmission`, `AttendanceRecord`, `OfficialExamRecord`, `SupportRequest`, `StudyTopic`, `StudyExercise`, `Test`, `TestAttempt`, `TestAttemptResult` trong [FRONTEND_DATA_MODEL.md](file:///d:/Web/english-center-mini/docs/FRONTEND_DATA_MODEL.md).
9. **Những rủi ro nào có thể phát sinh khi tích hợp?**
   - Lệch đồng hồ giữa Client và Server trong phòng thi `Test Online` (cần lấy thời gian máy chủ làm chuẩn cho `deadlineAt`); cấu hình CORS khi dùng `credentials: 'include'`; và giới hạn tốc độ (Rate Limiting) khi học viên chuyển câu hỏi liên tục.
10. **Dự án cần hoàn thành những việc gì trước khi bắt đầu kết nối Backend?**
    - Thống nhất tài liệu `FRONTEND_API_CONTRACT.md` và `BACKEND_INTEGRATION_CHECKLIST.md` với đội phát triển Backend Node.js để triển khai Database Schema và các REST Endpoints tương ứng.
