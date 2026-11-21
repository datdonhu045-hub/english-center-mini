# NHẬT KÝ SỬA LỖI & CHUẨN HÓA (`BUG_FIX_LOG.md`)

Tài liệu này ghi nhận các lỗi thực tế đã được phát hiện, sửa chữa và kiểm chứng qua `npm run lint` (`oxlint`) và `npm run build` (`tsc -b && vite build`).

---

## 1. [BUG-01] (P0 – Critical) Chưa xóa Cache TanStack Query khi Học viên Đăng xuất
- **Hiện tượng:** Khi học viên A đăng xuất và đăng nhập tài khoản học viên B ngay trong cùng phiên trình duyệt, các dữ liệu đã cache trong `queryClient` có nguy cơ còn lưu trong bộ nhớ.
- **Nguyên nhân:** `authService.logout()` mới chỉ xóa phiên trong `localStorage`/`sessionStorage` (`authSessionStore.setCurrentUser(null)`) mà chưa xóa cache của `queryClient`.
- **File ảnh hưởng:** [src/features/auth/services/authService.ts](file:///d:/Web/english-center-mini/src/features/auth/services/authService.ts)
- **Cách khắc phục:** Gọi `queryClient.clear()` ngay trong `authService.logout()`.
- **Kết quả kiểm thử:** Cache được dọn sạch hoàn toàn ngay khi đăng xuất.

---

## 2. [BUG-02] (P0 – Critical) Lịch sử làm bài Test Online chưa phân tách theo Tài khoản Học viên (`studentId`)
- **Hiện tượng:** Trang Lịch sử làm bài (`/test-history` và `/student/history`) hiển thị chung toàn bộ các lượt thi có trong `localStorage` cho mọi tài khoản đăng nhập.
- **Nguyên nhân:** Thực thể `TestAttempt` chưa có trường `studentId`, `attemptStorageService.createNewAttempt` chưa gắn ID người dùng hiện tại, và `historyApi.getHistory` chưa lọc theo `studentId`.
- **File ảnh hưởng:**
  - [src/features/test-online/types/test.types.ts](file:///d:/Web/english-center-mini/src/features/test-online/types/test.types.ts)
  - [src/features/test-online/services/attemptService.ts](file:///d:/Web/english-center-mini/src/features/test-online/services/attemptService.ts)
  - [src/features/test-online/api/historyApi.ts](file:///d:/Web/english-center-mini/src/features/test-online/api/historyApi.ts)
  - [src/features/test-online/hooks/useTestHistory.ts](file:///d:/Web/english-center-mini/src/features/test-online/hooks/useTestHistory.ts)
- **Cách khắc phục:** Bổ sung `studentId` vào `TestAttempt`, gán `studentId` từ `authSessionStore.getCurrentUser()?.id` khi tạo lượt thi mới, lọc theo `currentUserId` trong `historyApi.getHistory`, và đưa `studentScope` vào `queryKey` của `useTestHistory`.
- **Kết quả kiểm thử:** Mỗi tài khoản học viên chỉ nhìn thấy đúng lịch sử thi của chính mình.

---

## 3. [BUG-03] (P1 – High) Phải bấm 2 lần ở lần thoát bài làm đầu tiên trong Test Online & Study Zone
- **Hiện tượng:** Khi học viên đang làm đề thi TOEIC hoặc bài tập Study Zone, bấm nút Quay lại trên giao diện rồi bấm *"Thoát bài làm"* trong Modal xác nhận, lần bấm đầu tiên không thoát được mà giữ nguyên Modal; phải bấm lần thứ hai mới thoát.
- **Nguyên nhân:** `handleConfirmExit` gọi `setAllowLeaveWithoutPrompt(true)` (cập nhật React state bất đồng bộ) rồi gọi ngay `navigate(...)`. Tại thời điểm `navigate()` chạy đồng bộ, `useBlocker` vẫn đọc giá trị state cũ (`false`) nên chặn điều hướng.
- **File ảnh hưởng:**
  - [src/features/test-online/pages/TestTakingPage.tsx](file:///d:/Web/english-center-mini/src/features/test-online/pages/TestTakingPage.tsx)
  - [src/features/study-zone/pages/StudyExercisePage.tsx](file:///d:/Web/english-center-mini/src/features/study-zone/pages/StudyExercisePage.tsx)
- **Cách khắc phục:** Thay state `allowLeaveWithoutPrompt` bằng `allowLeaveRef = useRef(false)` đồng bộ trong điều kiện của `useBlocker`.
- **Kết quả kiểm thử:** Bấm *"Thoát bài làm"* thoát ngay lập tức ở lần bấm đầu tiên.

---

## 4. [BUG-04] (P1 – High) `attemptApi.confirmPartIntroduction` thiếu nhánh gọi REST API thật
- **Hiện tượng:** Trong `attemptApi.ts`, các hàm khác đều có nhánh `if (!USE_MOCK_API)` để gọi `httpClient`, riêng `confirmPartIntroduction` chỉ thao tác trên `attemptStorageService`.
- **Nguyên nhân:** Thiếu nhánh gọi `httpClient.post` khi `USE_MOCK_API = false`.
- **File ảnh hưởng:** [src/features/test-online/api/attemptApi.ts](file:///d:/Web/english-center-mini/src/features/test-online/api/attemptApi.ts)
- **Cách khắc phục:** Bổ sung nhánh `if (!USE_MOCK_API)` gửi `POST /public/test-attempts/:attemptId/progress` với payload `{ action: 'confirm_part_intro', partNumber, firstQuestionId }`.
- **Kết quả kiểm thử:** Toàn bộ 100% phương thức trong `attemptApi` đã có nhánh gọi Backend thật.

---

## 5. [BUG-05] (P1 – High) `historyApi.getHistory` chưa truyền tham số lọc lên REST API khi tắt Mock
- **Hiện tượng:** Khi chạy ở chế độ `!USE_MOCK_API`, `historyApi.getHistory(params)` gọi `httpClient.get(API_ENDPOINTS.testOnline.historyList)` mà bỏ quên đối số `params`.
- **Nguyên nhân:** Thiếu truyền query parameters vào `httpClient.get`.
- **File ảnh hưởng:** [src/features/test-online/api/historyApi.ts](file:///d:/Web/english-center-mini/src/features/test-online/api/historyApi.ts)
- **Cách khắc phục:** Truyền đầy đủ `{ keyword, testSlug, status, fromDate, toDate, sortOrder }` vào `httpClient.get`.
- **Kết quả kiểm thử:** Các bộ lọc lịch sử thi hoạt động đồng nhất ở cả chế độ Mock và API.

---

## 6. [BUG-06] (P2 – Medium) Mở rộng `httpClient` và đồng bộ `courseId` giữa Student Portal & Courses
- **Hiện tượng:** `httpClient.ts` mới chỉ hỗ trợ `GET`, `POST` với `credentials: 'omit'`; `courseId` trong dữ liệu mẫu của lớp học `HMC-S01` là `'crs-submarine-700'` trong khi danh mục khóa học công khai dùng `'submarine-toeic'`.
- **File ảnh hưởng:**
  - [src/services/api/httpClient.ts](file:///d:/Web/english-center-mini/src/services/api/httpClient.ts)
  - [src/features/student-portal/mocks/studentPortalMockData.ts](file:///d:/Web/english-center-mini/src/features/student-portal/mocks/studentPortalMockData.ts)
- **Cách khắc phục:** Mở rộng `httpClient` hỗ trợ `GET`, `POST`, `PATCH`, `DELETE` kèm `credentials: 'include'`; chuẩn hóa `courseId: 'submarine-toeic'`.
- **Kết quả kiểm thử:** `npm run lint` và `npm run build` đạt **0 warnings, 0 errors**.
