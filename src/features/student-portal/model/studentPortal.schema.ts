import type {
  AssignmentItem,
  SubmitDemoScoreInput,
  SubmitHomeworkInput,
  SupportRequestCategoryConfig,
  SupportRequestType,
} from './studentPortal.types';

export const SUPPORT_REQUEST_CATEGORIES: Record<
  SupportRequestType,
  SupportRequestCategoryConfig
> = {
  retake: {
    type: 'retake',
    title: 'Học lại',
    description: 'Đã hoàn thành khóa, đủ chuyên cần nhưng chưa đạt mục tiêu.',
    reasons: ['Chưa đạt mục tiêu đầu ra', 'Muốn ôn lại kiến thức'],
  },
  hold: {
    type: 'hold',
    title: 'Bảo lưu',
    description: 'Tạm dừng học vì lý do chính đáng.',
    reasons: [
      'Sức khỏe',
      'Công việc hoặc học tập bận',
      'Lý do gia đình',
      'Lý do khác',
    ],
  },
  resume: {
    type: 'resume',
    title: 'Bảo lưu quay lại học',
    description: 'Đã có đơn bảo lưu và muốn xếp lớp học tiếp.',
    reasons: ['Đã sẵn sàng học lại', 'Cần đổi ca khi quay lại'],
  },
  transfer: {
    type: 'transfer',
    title: 'Chuyển lớp',
    description: 'Đổi ca học, đổi lớp hoặc đổi cơ sở.',
    reasons: ['Trùng lịch học', 'Đổi cơ sở', 'Đổi ca học'],
  },
};

/**
 * Kiểm tra dữ liệu nộp BTVN (Link Google Drive/Docs + số câu đúng LC/RC)
 */
export function validateHomeworkSubmission(
  assignment: AssignmentItem,
  input: SubmitHomeworkInput
): string | null {
  const link = input.driveLink.trim();
  if (!link) {
    return 'Hãy nhập link bài nộp.';
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(link);
  } catch {
    return 'Link không hợp lệ. Hãy dán đầy đủ, bắt đầu bằng https://';
  }

  if (
    parsedUrl.protocol !== 'https:' ||
    !/^(drive|docs)\.google\.com$/i.test(parsedUrl.hostname)
  ) {
    return 'Chỉ nhận link Google Drive hoặc Google Docs.';
  }

  const lcPart = assignment.parts?.find((p) => p.key === 'lc');
  const rcPart = assignment.parts?.find((p) => p.key === 'rc');

  if (lcPart) {
    if (
      !Number.isInteger(input.lcCorrect) ||
      input.lcCorrect < 0 ||
      input.lcCorrect > lcPart.maxQuestions
    ) {
      return `${lcPart.label}: nhập số nguyên từ 0 đến ${lcPart.maxQuestions}.`;
    }
  }

  if (rcPart) {
    if (
      !Number.isInteger(input.rcCorrect) ||
      input.rcCorrect < 0 ||
      input.rcCorrect > rcPart.maxQuestions
    ) {
      return `${rcPart.label}: nhập số nguyên từ 0 đến ${rcPart.maxQuestions}.`;
    }
  }

  return null;
}

/**
 * Kiểm tra điểm tự nhập Demo Test (0–495 cho từng kỹ năng LC và RC)
 */
export function validateDemoScoreSubmission(input: SubmitDemoScoreInput): string | null {
  if (
    !Number.isInteger(input.lcScore) ||
    !Number.isInteger(input.rcScore) ||
    input.lcScore < 0 ||
    input.rcScore < 0 ||
    input.lcScore > 495 ||
    input.rcScore > 495
  ) {
    return 'Điểm mỗi phần là số nguyên từ 0 đến 495.';
  }
  return null;
}

/**
 * Tính tổng điểm Demo Test tham khảo từ LC và RC.
 * Lưu ý nghiệp vụ: Đây là điểm học viên tự nhập để theo dõi tiến độ, trạng thái "Chờ kiểm tra" cho đến khi giáo viên xác nhận.
 */
export function calculateReferenceDemoTotal(lcScore: number, rcScore: number): {
  lc: number;
  rc: number;
  total: number;
} {
  const lc = Math.min(495, Math.max(0, Math.round(lcScore)));
  const rc = Math.min(495, Math.max(0, Math.round(rcScore)));
  return {
    lc,
    rc,
    total: lc + rc,
  };
}

/**
 * Kiểm tra form gửi yêu cầu hỗ trợ sau khóa học
 */
export function validateSupportRequestInput(input: {
  reason: string;
  content: string;
}): string | null {
  if (!input.reason.trim()) {
    return 'Hãy chọn lý do.';
  }
  if (input.content.trim().length < 10) {
    return 'Nội dung cần ít nhất 10 ký tự.';
  }
  return null;
}
