# CÁC HẠNG MỤC PHỤ THUỘC BACKEND & ĐỀ XUẤT GIAI ĐOẠN TIẾP THEO (REMAINING ISSUES)

Sau đợt kiểm toán toàn diện và dọn dẹp mã nguồn, toàn bộ các lỗi giao diện, thương hiệu, đồng bộ dữ liệu Mock, phân lập người dùng ở Client và mã thừa trên Frontend **đã được giải quyết triệt để**.

Tài liệu này ghi nhận minh bạch các giới hạn tất yếu của một ứng dụng **Frontend chạy Mock Data (chưa có Backend Node.js & Database)** để đội ngũ Backend và Quản trị hệ thống tiếp nhận xử lý ở giai đoạn tiếp theo.

---

## 1. CÁC GIỚI HẠN BẢO MẬT & DỮ LIỆU CẦN BACKEND NODE.JS GIẢI QUYẾT

| STT | Hạng mục | Hiện trạng trên Frontend (Giai đoạn Mock) | Giải pháp bắt buộc khi triển khai Backend Node.js |
| --- | --- | --- | --- |
| 1 | **Ẩn tuyệt đối Đáp án đề thi (`Answer Key`) khỏi trình duyệt** | Đã tách riêng đối tượng `serverTestAnswerKeys` khỏi cấu trúc câu hỏi `TestQuestion`, nhưng do chấm điểm Mock đang chạy trên trình duyệt nên dữ liệu này vẫn nằm trong bundle JS nếu người dùng mở DevTools dò mã nguồn. | Di chuyển hoàn toàn `serverTestAnswerKeys` và `scoringService` lên Backend Node.js + Database; chỉ trả đáp án đúng và `explanation` sau khi lượt thi đã chuyển sang `status = 'submitted'`. |
| 2 | **Xác thực Token bằng `HttpOnly Cookie` & Phân quyền Server-side** | Phiên đăng nhập Mock đang lưu thông tin `AuthUser` (không có mật khẩu) trong `localStorage`/`sessionStorage` và kiểm tra role tại `ProtectedRoute.tsx`. | Backend cấp `Access Token` + `HttpOnly Refresh Cookie`, xác thực chữ ký JWT và kiểm tra RBAC/Ownership trên mọi API request. |
| 3 | **Chống gian lận đồng hồ đếm ngược tuyệt đối** | `useTestTimer` tính theo mốc `expiresAt` (`ISO-8601`) thay vì chỉ đếm `setInterval`, hạn chế trôi giờ khi đổi tab, nhưng người dùng vẫn có thể chỉnh đồng hồ hệ thống máy tính nếu chạy thuần offline. | Khi tạo lượt thi (`POST /attempts/start`), Server gắn dấu thời gian chuẩn của máy chủ và từ chối mọi request lưu/nộp bài gửi sau `expires_at + 5s`. |
| 4 | **Dung lượng bộ đề mẫu & Lưu trữ Audio/Hình ảnh thực tế** | Mỗi đề trong 12 đề TOEIC hiện có 23 câu hỏi đại diện phủ đủ 7 Part (kèm `standardTotalQuestions: 200` để minh họa cấu trúc) và dùng audio/ảnh minh họa hợp lệ. | Xây dựng công cụ Import đề thi (Excel/JSON + Upload MP3/WebP lên S3/Cloudflare R2) trên trang Quản trị Admin để nhập đủ 200 câu/đề cho kho đề thực tế. |
| 5 | **Phân hệ Thi TOEIC Speaking & Writing** | Tab `Speaking & Writing` trên trang `/test-online` đã được thiết kế trạng thái thông báo rõ ràng là đang phát triển, không trộn lẫn cấu trúc 7 Part của Listening & Reading. | Khi trung tâm mở rộng thi 4 kỹ năng, cần xây dựng module thu âm Microphone (`MediaRecorder` API), trình soạn thảo đếm từ cho Writing và luồng Giảng viên chấm bài theo tiêu chí Rubric riêng. |
| 6 | **Giao diện Quản trị nội bộ (Admin / Giáo vụ / Giảng viên / Kế toán)** | Ngoài phạm vi của ứng dụng Học viên & Website hiện tại; dữ liệu đầu vào đang được cung cấp qua tầng Mock chuẩn hóa. | Xây dựng Admin Portal hoặc tích hợp CMS gọi vào các endpoint Backoffice đã đặc tả trong [FRONTEND_API_CONTRACT.md](file:///d:/Web/english-center-mini/docs/FRONTEND_API_CONTRACT.md). |

---

## 2. KẾT LUẬN MỨC ĐỘ SẴN SÀNG CỦA HỆ THỐNG

- **Mức độ hoàn thiện Frontend hiện tại:** **Sẵn sàng (Production-Ready Frontend Architecture)**.
- Codebase sạch 100% file mồ côi, thống nhất thương hiệu **`English Center`** và bảng màu xanh dương nhạt `#75BDEB`, dữ liệu dùng chung đồng bộ xuyên suốt 16 nhóm thực thể, và tầng API/Repository đã sẵn sàng chuyển sang Backend Node.js chỉ qua cấu hình `.env` (`VITE_USE_MOCK_API=false`).
