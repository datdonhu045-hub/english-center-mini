import type {
  AssignmentItem,
  AssignmentSubmission,
  AssignmentWithSubmission,
  AttendanceRecord,
  AttendanceStatus,
  LearningResource,
  LessonActivityType,
  LessonSession,
  StudentClassInfo,
  StudentExamResultsOverview,
  StudentPortalDataset,
  StudentProfile,
  SupportRequestRecord,
} from '../model/studentPortal.types';
import { LESSON_ACTIVITY_LABELS } from '../model/studentPortal.types';

const DAY_MS = 86_400_000;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

const DOC_BASE_URL = 'https://drive.google.com/drive/folders/hmc-toeic-';

const GENERAL_RESOURCES: LearningResource[] = [
  {
    id: 'res-gen-1',
    title: 'Giáo trình và file âm thanh của khóa',
    kind: 'PDF',
    url: `${DOC_BASE_URL}giao-trinh-khoa`,
    isCourseGeneral: true,
  },
  {
    id: 'res-gen-2',
    title: 'Bộ video hướng dẫn Reading',
    kind: 'Video',
    url: `${DOC_BASE_URL}video-reading`,
    isCourseGeneral: true,
  },
  {
    id: 'res-gen-3',
    title: 'Bài tập về nhà mẫu',
    kind: 'Link',
    url: `${DOC_BASE_URL}btvn-mau`,
    isCourseGeneral: true,
  },
  {
    id: 'res-gen-4',
    title: 'Folder nộp bài của lớp',
    kind: 'Link',
    url: `${DOC_BASE_URL}folder-nop-bai`,
    isCourseGeneral: true,
  },
];

const WEEKLY_TOPICS: Array<[string, string]> = [
  ['Part 1–2: mô tả tranh, hỏi đáp', 'Từ loại và cấu trúc câu'],
  ['Part 3: hội thoại ngắn', 'Thì của động từ'],
  ['Part 4: bài nói ngắn', 'Đại từ và giới từ'],
  ['Part 3–4 nâng cao', 'Part 6: điền từ vào đoạn văn'],
  ['Luyện nghe tổng hợp', 'Part 7 đoạn đơn'],
  ['Part 3–4 theo chủ đề', 'Part 7 đoạn đôi'],
  ['Nghe nhanh, bắt từ khóa', 'Part 7 đoạn ba'],
  ['Ôn tập Part 1–4', 'Ôn tập Part 5–7'],
];

interface SeedConfig {
  student: StudentProfile;
  classInfo: StudentClassInfo | null;
  startDateObj: Date;
  referenceTodayObj: Date;
}

function getSeedConfigForStudent(
  studentId: string,
  fallbackUser?: { fullName?: string; email?: string; phone?: string }
): SeedConfig {
  const now = new Date();
  const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Mặc định khóa học khai giảng ngày 12/10/2026 như bản mẫu
  const startObj = new Date(2026, 9, 12);

  if (studentId === 'stu-002') {
    return {
      student: {
        id: 'stu-002',
        studentCode: 'HV-2026-002',
        fullName: fallbackUser?.fullName || 'Nguyễn Minh Anh',
        email: fallbackUser?.email || 'minhanh@student.hmctoeic.edu.vn',
        phone: fallbackUser?.phone || '0912345678',
        entryScore: { lc: 290, rc: 270, total: 560 },
        goalScore: { lc: 405, rc: 350, total: 755 },
      },
      classInfo: {
        id: 'cls-hmc-s01',
        classCode: 'HMC-S01',
        courseId: 'submarine-toeic',
        courseName: 'Submarine 700+',
        teacherName: 'Cô Lan Hương',
        branchName: 'Cơ sở 1 – Cầu Giấy (mẫu)',
        scheduleDays: 'Thứ 2, 4, 6',
        scheduleTime: '18:00–20:00',
        roomName: 'Phòng 2 (mẫu)',
        startDate: toIsoDate(startObj),
        endDate: toIsoDate(addDays(startObj, 7 * 7 + 4)),
        totalWeeks: 8,
        totalSessions: 24,
      },
      startDateObj: startObj,
      referenceTodayObj: todayObj,
    };
  }

  if (studentId === 'stu-001') {
    return {
      student: {
        id: 'stu-001',
        studentCode: 'HV-2026-001',
        fullName: fallbackUser?.fullName || 'Đỗ Như Đạt',
        email: fallbackUser?.email || 'dat.donhu@student.hmctoeic.edu.vn',
        phone: fallbackUser?.phone || '0987654321',
        entryScore: { lc: 290, rc: 270, total: 560 },
        goalScore: { lc: 405, rc: 350, total: 755 },
      },
      classInfo: {
        id: 'cls-hmc-s01',
        classCode: 'HMC-S01',
        courseId: 'submarine-toeic',
        courseName: 'Submarine 700+',
        teacherName: 'Cô Lan Hương',
        branchName: 'Cơ sở 1 – Cầu Giấy (mẫu)',
        scheduleDays: 'Thứ 2, 4, 6',
        scheduleTime: '18:00–20:00',
        roomName: 'Phòng 2 (mẫu)',
        startDate: toIsoDate(startObj),
        endDate: toIsoDate(addDays(startObj, 7 * 7 + 4)),
        totalWeeks: 8,
        totalSessions: 24,
      },
      startDateObj: startObj,
      referenceTodayObj: todayObj,
    };
  }

  // Tài khoản học viên mới tự đăng ký -> chưa được giáo vụ xếp lớp chính thức
  return {
    student: {
      id: studentId,
      studentCode: `HV-${studentId.slice(-4).toUpperCase()}`,
      fullName: fallbackUser?.fullName || 'Học viên HMC TOEIC',
      email: fallbackUser?.email || 'student@hmctoeic.edu.vn',
      phone: fallbackUser?.phone || '0900000000',
      entryScore: { lc: 0, rc: 0, total: 0 },
      goalScore: { lc: 300, rc: 250, total: 550 },
    },
    classInfo: null,
    startDateObj: startObj,
    referenceTodayObj: todayObj,
  };
}

function buildSessionsAndAssignments(startDateObj: Date): {
  lessons: LessonSession[];
  assignmentItems: AssignmentItem[];
} {
  const lessons: LessonSession[] = [];
  const assignmentItems: AssignmentItem[] = [];

  for (let i = 0; i < 24; i += 1) {
    const n = i + 1;
    const w = Math.floor(i / 3);
    const specialType: Record<number, LessonActivityType> = {
      11: 'demo',
      12: 'mid',
      23: 'demo',
      24: 'final',
    };
    const type: LessonActivityType =
      specialType[n] || (i % 3 === 2 ? 'review' : 'class');
    const isTest = type !== 'class' && type !== 'review';

    const sessionDateObj = addDays(startDateObj, w * 7 + [0, 2, 4][i % 3]);
    const sessionDateIso = toIsoDate(sessionDateObj);
    const lessonId = `les-${pad2(n)}`;

    const title = isTest
      ? `${LESSON_ACTIVITY_LABELS[type]}${type === 'demo' ? ` ${n === 11 ? 1 : 2}` : ''}`
      : `${type === 'review' ? 'Ôn tập: ' : ''}${WEEKLY_TOPICS[w][0]}`;

    const resources: LearningResource[] = isTest
      ? []
      : [
          {
            id: `res-${n}-pdf`,
            lessonId,
            title: `Giáo trình Unit ${w + 1}`,
            kind: 'PDF',
            url: `${DOC_BASE_URL}giao-trinh-unit-${w + 1}`,
          },
          {
            id: `res-${n}-audio`,
            lessonId,
            title: `Audio buổi ${n}`,
            kind: 'Audio',
            url: `${DOC_BASE_URL}audio-buoi-${n}`,
          },
          ...(i % 3 === 0
            ? [
                {
                  id: `res-${n}-video`,
                  lessonId,
                  title: `Video chữa bài tuần ${w + 1}`,
                  kind: 'Video' as const,
                  url: `${DOC_BASE_URL}video-tuan-${w + 1}`,
                },
              ]
            : []),
        ];

    let assignmentId: string | undefined;
    if (type !== 'mid' && type !== 'final') {
      const isDemo = type === 'demo';
      assignmentId = `${isDemo ? 'D' : 'B'}${pad2(n)}`;
      const dueDateObj = addDays(sessionDateObj, 2);
      dueDateObj.setHours(23, 0, 0, 0);

      assignmentItems.push({
        id: assignmentId,
        lessonId,
        sessionNumber: n,
        weekIndex: w,
        code: `${isDemo ? 'Demo Test ' : 'BTVN '}${n}`,
        title: isDemo ? title : `BTVN buổi ${n}: ${title}`,
        assignedDate: sessionDateIso,
        dueDate: dueDateObj.toISOString(),
        isDemoTest: isDemo,
        parts: isDemo
          ? null
          : [
              {
                key: 'lc',
                label: 'Listening (LC)',
                maxQuestions: type === 'review' ? 30 : 20,
              },
              {
                key: 'rc',
                label: 'Reading (RC)',
                maxQuestions: type === 'review' ? 30 : 20,
              },
            ],
      });
    }

    lessons.push({
      id: lessonId,
      learningPlanId: 'lp-submarine-700',
      sessionNumber: n,
      weekIndex: w,
      date: sessionDateIso,
      type,
      title,
      lcContent: isTest ? 'Làm phần Listening theo đề' : WEEKLY_TOPICS[w][0],
      rcContent: isTest ? 'Làm phần Reading theo đề' : WEEKLY_TOPICS[w][1],
      resources,
      assignmentId,
    });
  }

  return { lessons, assignmentItems };
}

function getStorageKeyForSubmissions(studentId: string): string {
  return `hmc_portal_submissions_v1_${studentId}`;
}

function getStorageKeyForSupportRequests(studentId: string): string {
  return `hmc_portal_support_requests_v1_${studentId}`;
}

function buildInitialSubmissions(
  studentId: string,
  assignmentItems: AssignmentItem[],
  todayObj: Date
): Record<string, AssignmentSubmission> {
  const nowMs = Date.now();
  const todayIso = toIsoDate(todayObj);
  const seeded: Record<string, AssignmentSubmission> = {};

  assignmentItems.forEach((item, index) => {
    if (item.assignedDate > todayIso || index % 9 === 8) {
      return;
    }

    const dueMs = new Date(item.dueDate).getTime();
    const diffMs = dueMs - nowMs;
    const driveUrl = `https://drive.google.com/drive/folders/${item.id.toLowerCase()}-mau`;

    if (diffMs < -3 * DAY_MS) {
      if (item.isDemoTest) {
        seeded[item.id] = {
          assignmentId: item.id,
          studentId,
          status: 'passed',
          demoScores: { lc: 310, rc: 285, total: 595 },
          isConfirmedByTeacher: true,
          teacherComment: 'Điểm đã được giáo viên xác nhận.',
        };
      } else if (index % 6 === 4) {
        const lcMax = item.parts?.[0]?.maxQuestions ?? 20;
        const rcMax = item.parts?.[1]?.maxQuestions ?? 20;
        seeded[item.id] = {
          assignmentId: item.id,
          studentId,
          status: 'failed',
          driveLink: driveUrl,
          partScores: {
            lc: Math.round(lcMax * 0.4),
            rc: Math.round(rcMax * 0.35),
          },
          isConfirmedByTeacher: true,
          teacherComment: 'Cần làm lại phần sai ở bước chữa bài.',
        };
      } else {
        const lcMax = item.parts?.[0]?.maxQuestions ?? 20;
        const rcMax = item.parts?.[1]?.maxQuestions ?? 20;
        seeded[item.id] = {
          assignmentId: item.id,
          studentId,
          status: 'passed',
          driveLink: driveUrl,
          partScores: {
            lc: Math.round(lcMax * 0.8),
            rc: Math.round(rcMax * 0.75),
          },
          isConfirmedByTeacher: true,
          teacherComment: 'Làm bài đầy đủ, chữa bài kỹ.',
        };
      }
    } else if (diffMs < 0) {
      if (item.isDemoTest) {
        seeded[item.id] = {
          assignmentId: item.id,
          studentId,
          status: 'submitted',
          demoScores: { lc: 300, rc: 280, total: 580 },
          isConfirmedByTeacher: false,
        };
      } else {
        const lcMax = item.parts?.[0]?.maxQuestions ?? 20;
        const rcMax = item.parts?.[1]?.maxQuestions ?? 20;
        seeded[item.id] = {
          assignmentId: item.id,
          studentId,
          status: 'submitted',
          driveLink: driveUrl,
          partScores: {
            lc: Math.round(lcMax * 0.7),
            rc: Math.round(rcMax * 0.65),
          },
          isConfirmedByTeacher: false,
        };
      }
    }
  });

  return seeded;
}

export function loadStoredSubmissions(
  studentId: string,
  assignmentItems: AssignmentItem[],
  todayObj: Date
): Record<string, AssignmentSubmission> {
  const key = getStorageKeyForSubmissions(studentId);
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as Record<string, AssignmentSubmission>;
    }
  } catch {
    // ignore storage parse error
  }

  const initial = buildInitialSubmissions(studentId, assignmentItems, todayObj);
  try {
    window.localStorage.setItem(key, JSON.stringify(initial));
  } catch {
    // ignore storage write error
  }
  return initial;
}

export function saveStoredSubmission(
  studentId: string,
  submission: AssignmentSubmission,
  assignmentItems: AssignmentItem[],
  todayObj: Date
): void {
  const current = loadStoredSubmissions(studentId, assignmentItems, todayObj);
  const updated = {
    ...current,
    [submission.assignmentId]: submission,
  };
  try {
    window.localStorage.setItem(
      getStorageKeyForSubmissions(studentId),
      JSON.stringify(updated)
    );
  } catch {
    // ignore storage write error
  }
}

export function loadStoredSupportRequests(studentId: string): SupportRequestRecord[] {
  const key = getStorageKeyForSupportRequests(studentId);
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as SupportRequestRecord[];
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredSupportRequest(
  studentId: string,
  record: SupportRequestRecord
): SupportRequestRecord[] {
  const current = loadStoredSupportRequests(studentId);
  const next = [record, ...current];
  try {
    window.localStorage.setItem(
      getStorageKeyForSupportRequests(studentId),
      JSON.stringify(next)
    );
  } catch {
    // ignore
  }
  return next;
}

export function buildMockPortalDataset(
  studentId: string,
  fallbackUser?: { fullName?: string; email?: string; phone?: string }
): StudentPortalDataset {
  const config = getSeedConfigForStudent(studentId, fallbackUser);
  const todayIso = toIsoDate(config.referenceTodayObj);

  if (!config.classInfo) {
    return {
      hasEnrollment: false,
      student: config.student,
      classInfo: null,
      generalResources: [],
      lessons: [],
      assignments: [],
      attendance: [],
      examResults: {
        entryScore: config.student.entryScore,
        goalScore: config.student.goalScore,
        midTerm: null,
        finalTerm: null,
      },
      supportRequests: loadStoredSupportRequests(studentId),
      referenceToday: todayIso,
    };
  }

  const { lessons, assignmentItems } = buildSessionsAndAssignments(config.startDateObj);
  const storedSubmissions = loadStoredSubmissions(
    studentId,
    assignmentItems,
    config.referenceTodayObj
  );
  const nowMs = Date.now();

  const assignments: AssignmentWithSubmission[] = assignmentItems.map((item) => {
    const sub: AssignmentSubmission = storedSubmissions[item.id] ?? {
      assignmentId: item.id,
      studentId,
      status: 'todo',
    };
    const isUnlocked = item.assignedDate <= todayIso;
    const isOverdue = sub.status === 'todo' && new Date(item.dueDate).getTime() < nowMs;

    return {
      ...item,
      submission: sub,
      isUnlocked,
      isOverdue,
    };
  });

  const specialAttendanceMap: Record<number, AttendanceStatus> = {
    4: 'late',
    7: 'excused',
    13: 'absent',
  };

  const attendance: AttendanceRecord[] = lessons.map((lesson, idx) => {
    const status: AttendanceStatus =
      lesson.date > todayIso ? 'none' : specialAttendanceMap[idx] || 'on';
    return {
      id: `att-${lesson.id}`,
      lessonId: lesson.id,
      sessionNumber: lesson.sessionNumber,
      date: lesson.date,
      lessonTitle: lesson.title,
      lessonType: lesson.type,
      status,
    };
  });

  const midSession = lessons[11];
  const finalSession = lessons[23];

  const examResults: StudentExamResultsOverview = {
    entryScore: config.student.entryScore,
    goalScore: config.student.goalScore,
    midTerm: {
      id: 'exam-mid-s01',
      examType: 'mid',
      examDate: midSession.date,
      lcScore: 330,
      rcScore: 305,
      totalScore: 635,
      isConfirmed: true,
      parts: {
        p1: { correct: 5, total: 6 },
        p2: { correct: 21, total: 25 },
        p3: { correct: 30, total: 39 },
        p4: { correct: 20, total: 30 },
        p5: { correct: 22, total: 30 },
        p6: { correct: 10, total: 16 },
        p7s: { correct: 20, total: 29 },
        p7d: { correct: 6, total: 10 },
        p7t: { correct: 8, total: 15 },
      },
    },
    finalTerm: null,
    expectedFinalDate: finalSession?.date,
  };

  return {
    hasEnrollment: true,
    student: config.student,
    classInfo: config.classInfo,
    generalResources: GENERAL_RESOURCES,
    lessons,
    assignments,
    attendance,
    examResults,
    supportRequests: loadStoredSupportRequests(studentId),
    referenceToday: todayIso,
  };
}
