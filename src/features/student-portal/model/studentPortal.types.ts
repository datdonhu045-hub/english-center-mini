/**
 * Domain Models & DTOs cho HMC TOEIC Student Portal
 * Thiết kế theo quan hệ thực thể:
 * Student -> Enrollment -> Class -> Course
 * Class -> LearningPlan -> Lesson -> LearningResource / Assignment -> AssignmentSubmission
 * Student -> AttendanceRecord / ExamResult / SupportRequest
 */

export type LessonActivityType = 'class' | 'review' | 'demo' | 'mid' | 'final';

export const LESSON_ACTIVITY_LABELS: Record<LessonActivityType, string> = {
  class: 'Học trên lớp',
  review: 'Ôn tập',
  demo: 'Demo Test',
  mid: 'Middle Test',
  final: 'Final Test',
};

export type ResourceKind = 'PDF' | 'Audio' | 'Video' | 'Link';

export interface LearningResource {
  id: string;
  lessonId?: string;
  title: string;
  kind: ResourceKind;
  url: string;
  isCourseGeneral?: boolean;
}

export interface StudentProfile {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  entryScore: {
    lc: number;
    rc: number;
    total: number;
  };
  goalScore: {
    lc: number;
    rc: number;
    total: number;
  };
}

export interface StudentClassInfo {
  id: string;
  classCode: string;
  courseId: string;
  courseName: string;
  teacherName: string;
  branchName: string;
  scheduleDays: string;
  scheduleTime: string;
  roomName: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  totalWeeks: number;
  totalSessions: number;
}

export interface LessonSession {
  id: string;
  learningPlanId: string;
  sessionNumber: number; // 1..24
  weekIndex: number; // 0..7 (Tuần 1..8)
  date: string; // ISO YYYY-MM-DD
  type: LessonActivityType;
  title: string;
  lcContent: string;
  rcContent: string;
  resources: LearningResource[];
  assignmentId?: string;
}

export interface AssignmentPartConfig {
  key: 'lc' | 'rc';
  label: string;
  maxQuestions: number;
}

export type AssignmentSubmissionStatus = 'todo' | 'submitted' | 'passed' | 'failed';

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentSubmissionStatus, string> = {
  todo: 'Cần nộp',
  submitted: 'Chờ kiểm tra',
  passed: 'Đã đạt',
  failed: 'Chưa đạt',
};

export interface AssignmentItem {
  id: string;
  lessonId: string;
  sessionNumber: number;
  weekIndex: number;
  code: string;
  title: string;
  assignedDate: string; // ISO YYYY-MM-DD
  dueDate: string; // ISO string with 23:00
  isDemoTest: boolean;
  parts: AssignmentPartConfig[] | null;
}

export interface AssignmentSubmission {
  assignmentId: string;
  studentId: string;
  status: AssignmentSubmissionStatus;
  driveLink?: string;
  partScores?: {
    lc: number;
    rc: number;
  };
  demoScores?: {
    lc: number;
    rc: number;
    total: number;
  };
  isConfirmedByTeacher?: boolean;
  teacherComment?: string;
  submittedAt?: string;
}

export interface AssignmentWithSubmission extends AssignmentItem {
  submission: AssignmentSubmission;
  isUnlocked: boolean;
  isOverdue: boolean;
}

export interface SubmitHomeworkInput {
  assignmentId: string;
  driveLink: string;
  lcCorrect: number;
  rcCorrect: number;
}

export interface SubmitDemoScoreInput {
  assignmentId: string;
  lcScore: number;
  rcScore: number;
}

export type AttendanceStatus = 'on' | 'late' | 'excused' | 'absent' | 'none';

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  on: 'Đúng giờ',
  late: 'Muộn',
  excused: 'Có phép',
  absent: 'Không phép',
  none: 'Chưa học',
};

export interface AttendanceRecord {
  id: string;
  lessonId: string;
  sessionNumber: number;
  date: string; // ISO YYYY-MM-DD
  lessonTitle: string;
  lessonType: LessonActivityType;
  status: AttendanceStatus;
  note?: string;
}

export type ToeicPartKey =
  | 'p1'
  | 'p2'
  | 'p3'
  | 'p4'
  | 'p5'
  | 'p6'
  | 'p7s'
  | 'p7d'
  | 'p7t';

export const TOEIC_PART_LABELS: Record<ToeicPartKey, string> = {
  p1: 'Part 1',
  p2: 'Part 2',
  p3: 'Part 3',
  p4: 'Part 4',
  p5: 'Part 5',
  p6: 'Part 6',
  p7s: 'Part 7 đoạn đơn',
  p7d: 'Part 7 đoạn đôi',
  p7t: 'Part 7 đoạn ba',
};

export interface ExamPartAccuracy {
  correct: number;
  total: number;
}

export interface OfficialExamRecord {
  id: string;
  examType: 'mid' | 'final';
  examDate: string; // ISO YYYY-MM-DD
  lcScore: number;
  rcScore: number;
  totalScore: number;
  isConfirmed: boolean;
  parts: Record<ToeicPartKey, ExamPartAccuracy>;
}

export interface StudentExamResultsOverview {
  entryScore: {
    lc: number;
    rc: number;
    total: number;
  };
  goalScore: {
    lc: number;
    rc: number;
    total: number;
  };
  midTerm: OfficialExamRecord | null;
  finalTerm: OfficialExamRecord | null;
  expectedFinalDate?: string;
}

export type SupportRequestType = 'retake' | 'hold' | 'resume' | 'transfer';

export interface SupportRequestCategoryConfig {
  type: SupportRequestType;
  title: string;
  description: string;
  reasons: string[];
}

export interface SupportRequestRecord {
  id: string;
  studentId: string;
  type: SupportRequestType;
  reason: string;
  content: string;
  contact?: string;
  createdAt: string; // ISO string or formatted date
  status: 'pending' | 'processing' | 'resolved';
}

export interface CreateSupportRequestInput {
  type: SupportRequestType;
  reason: string;
  content: string;
  contact?: string;
}

export interface StudentPortalDataset {
  hasEnrollment: boolean;
  student: StudentProfile;
  classInfo: StudentClassInfo | null;
  generalResources: LearningResource[];
  lessons: LessonSession[];
  assignments: AssignmentWithSubmission[];
  attendance: AttendanceRecord[];
  examResults: StudentExamResultsOverview;
  supportRequests: SupportRequestRecord[];
  referenceToday: string; // ISO YYYY-MM-DD
}
