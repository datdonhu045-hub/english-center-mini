import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useStudentPortalData } from '../hooks/useStudentPortal';
import { NoEnrollmentCard } from '../components/NoEnrollmentCard';
import {
  AssignmentStatusChip,
  LessonTypeChip,
  PortalChip,
  PortalProgressBar,
  ResourceDocChip,
} from '../components/PortalUiBits';
import {
  ATTENDANCE_STATUS_LABELS,
  LESSON_ACTIVITY_LABELS,
  type AttendanceStatus,
} from '../model/studentPortal.types';
import {
  formatDateTimeVi,
  formatFullDateVi,
  formatShortWeekdayDate,
  getWeekIndexFromStart,
} from '../utils/portalDateUtils';

const ATTENDANCE_SQUARE_STYLES: Record<AttendanceStatus, string> = {
  on: 'bg-[#2878B8] border-[#2878B8]',
  late: 'bg-[#A7D8F5] border-[#75BDEB]',
  excused: 'bg-[#EAF6FD] border-[#75BDEB]',
  absent: 'bg-[#B93A2E] border-[#B93A2E]',
  none: 'bg-white border-[#DCEAF3]',
};

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useStudentPortalData();

  if (isLoading) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[14px] border border-[#DCEAF3] bg-white p-8 text-[#718096]">
        <Loader2 className="h-7 w-7 animate-spin text-[#2878B8]" />
        <p className="mt-2.5 text-[14px]">Đang tải dữ liệu học tập của bạn...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-6 text-center text-[#B93A2E]">
        Không thể tải dữ liệu Cổng học viên. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!data.hasEnrollment || !data.classInfo) {
    return <NoEnrollmentCard studentName={data.student.fullName} />;
  }

  const {
    student,
    classInfo,
    lessons,
    assignments,
    attendance,
    examResults,
    referenceToday,
  } = data;

  const unlockedAssignments = assignments.filter((a) => a.isUnlocked);
  const completedLessonsCount = lessons.filter(
    (s) => s.date <= referenceToday
  ).length;

  const todoList = unlockedAssignments
    .filter((a) => a.submission.status === 'todo')
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  const updatedList = unlockedAssignments
    .filter((a) => a.submission.status !== 'todo')
    .sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  const recentAssignments = [...todoList, ...updatedList].slice(0, 5);

  const passedCount = unlockedAssignments.filter(
    (a) => a.submission.status === 'passed'
  ).length;
  const submittedCount = unlockedAssignments.filter(
    (a) => a.submission.status !== 'todo'
  ).length;
  const failedCount = unlockedAssignments.filter(
    (a) => a.submission.status === 'failed'
  ).length;
  const missingOverdueCount = unlockedAssignments.filter(
    (a) => a.isOverdue
  ).length;

  const countAttendance = (st: AttendanceStatus) =>
    attendance.filter((item) => item.status === st).length;

  const maxWeekIndex = Math.max(0, ...lessons.map((l) => l.weekIndex));
  const rawCurrentWeek = getWeekIndexFromStart(
    classInfo.startDate,
    referenceToday
  );
  const currentWeekIndex = Math.min(
    Math.max(rawCurrentWeek, 0),
    maxWeekIndex
  );

  // Lịch học và hạn nộp tuần này
  const weeklyTimelineItems: Array<{
    timeMs: number;
    label: string;
    isDeadline: boolean;
    lessonType?: (typeof lessons)[number]['type'];
  }> = [];

  lessons
    .filter((s) => s.weekIndex === currentWeekIndex)
    .forEach((s) => {
      weeklyTimelineItems.push({
        timeMs: new Date(s.date).getTime(),
        label: `${formatShortWeekdayDate(s.date)} ${classInfo.scheduleTime.slice(0, 5)}: ${s.title}`,
        isDeadline: false,
        lessonType: s.type,
      });
    });

  assignments
    .filter(
      (a) =>
        getWeekIndexFromStart(classInfo.startDate, a.dueDate.slice(0, 10)) ===
        currentWeekIndex
    )
    .forEach((a) => {
      weeklyTimelineItems.push({
        timeMs: new Date(a.dueDate).getTime(),
        label: `Hạn ${a.code}: ${formatDateTimeVi(a.dueDate)}`,
        isDeadline: true,
      });
    });

  weeklyTimelineItems.sort((x, y) => x.timeMs - y.timeMs);

  const latestLessonWithDocs = [...lessons]
    .reverse()
    .find((s) => s.date <= referenceToday && s.resources.length > 0);

  const entryTotal = student.entryScore.total;
  const goalTotal = student.goalScore.total;
  const midTotal = examResults.midTerm?.totalScore ?? null;
  const finalTotal = examResults.finalTerm?.totalScore ?? null;

  return (
    <div>
      {/* 1. Banner chào mừng */}
      <section className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
        <h1 className="text-[25px] font-bold leading-[1.3] text-[#243B53]">
          Chào {student.fullName}
        </h1>
        <p className="mt-1 text-[15px] text-[#718096]">
          Mục tiêu: LC {student.goalScore.lc}, RC {student.goalScore.rc}, tổng{' '}
          {goalTotal}/990 (dữ liệu mẫu)
        </p>

        <div className="mt-3.5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Khóa học', classInfo.courseName],
            ['Lớp', classInfo.classCode],
            ['Giảng viên', classInfo.teacherName],
            ['Cơ sở', classInfo.branchName],
            ['Lịch học', `${classInfo.scheduleDays}, ${classInfo.scheduleTime}`],
            ['Khai giảng', formatFullDateVi(classInfo.startDate)],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[13px] text-[#718096]">{label}</div>
              <b className="text-[15px] font-bold text-[#243B53]">{value}</b>
            </div>
          ))}
        </div>

        <h2 className="mb-2 mt-[18px] text-[17px] font-bold text-[#243B53]">
          Tiến độ khóa học: {completedLessonsCount}/{lessons.length} buổi
        </h2>

        {/* 24-Session Ribbon */}
        <div className="flex flex-wrap gap-1">
          {lessons.map((lesson, idx) => {
            const attStatus = attendance[idx]?.status ?? 'none';
            const isTestSession =
              lesson.type !== 'class' && lesson.type !== 'review';

            return (
              <i
                key={lesson.id}
                title={`Buổi ${lesson.sessionNumber}, ${formatShortWeekdayDate(lesson.date)}: ${ATTENDANCE_STATUS_LABELS[attStatus]}${isTestSession ? ` (${LESSON_ACTIVITY_LABELS[lesson.type]})` : ''}`}
                className={`block h-[22px] w-[22px] border-2 ${
                  ATTENDANCE_SQUARE_STYLES[attStatus]
                } ${
                  isTestSession
                    ? 'rounded-full !border-[#E4571A]'
                    : 'rounded-[6px]'
                }`}
              />
            );
          })}
        </div>

        <p className="mt-2 text-[13px] text-[#718096]">
          Ô đặc: đã học. Ô đỏ: nghỉ không phép. Ô tròn viền cam: buổi kiểm tra.
          Ô viền xám: chưa học.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Link
            to="/student/learning-plan"
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#2878B8] px-4 py-[9px] text-[15px] font-semibold text-white transition hover:brightness-110"
          >
            Tài liệu &amp; Kế hoạch
          </Link>
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#EAF6FD] px-4 py-[9px] text-[15px] font-semibold text-[#2878B8] transition hover:brightness-95"
          >
            Nộp bài &amp; Điền điểm
          </Link>
        </div>
      </section>

      {/* 2. Bốn thẻ KPI */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <span className="text-[13px] text-[#718096]">
            Điểm đầu vào và lộ trình
          </span>
          <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
            {entryTotal}/{goalTotal}
          </b>
          <span className="text-[13px] text-[#243B53]">
            Đầu vào {entryTotal}, mục tiêu {goalTotal}
          </span>
          <PortalProgressBar
            percent={
              lessons.length
                ? Math.round((completedLessonsCount / lessons.length) * 100)
                : 0
            }
          />
        </div>

        <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <span className="text-[13px] text-[#718096]">Hoàn thành bài tập</span>
          <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
            {submittedCount}/{unlockedAssignments.length}
          </b>
          <span className="text-[13px] text-[#243B53]">
            Đạt {passedCount}, chưa đạt {failedCount}, còn thiếu{' '}
            {missingOverdueCount}
          </span>
          <PortalProgressBar
            percent={
              unlockedAssignments.length
                ? Math.round((passedCount / unlockedAssignments.length) * 100)
                : 0
            }
          />
        </div>

        <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <span className="text-[13px] text-[#718096]">Chuyên cần</span>
          <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
            {countAttendance('on') + countAttendance('late')} buổi
          </b>
          <span className="text-[13px] text-[#243B53]">
            Nghỉ {countAttendance('excused') + countAttendance('absent')}, muộn{' '}
            {countAttendance('late')}
          </span>
        </div>

        <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <span className="text-[13px] text-[#718096]">Kết quả thi</span>
          <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
            {midTotal !== null ? `Mid ${midTotal}` : 'Chưa có'}
          </b>
          <span className="text-[13px] text-[#243B53]">
            Final: {finalTotal !== null ? finalTotal : 'chưa có'}. Mục tiêu{' '}
            {goalTotal}
          </span>
        </div>
      </div>

      {/* 3. Khu vực hai cột */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Cột trái: Bài tập cần nộp và cập nhật gần đây */}
        <section className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <h2 className="text-[17px] font-bold text-[#243B53]">
            Bài tập cần nộp và cập nhật gần đây
          </h2>

          {recentAssignments.length > 0 ? (
            <div className="divide-y divide-[#DCEAF3]">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="py-3 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b className="text-[15px] font-bold text-[#243B53]">
                      {assignment.title}
                    </b>
                    <AssignmentStatusChip status={assignment.submission.status} />
                  </div>
                  <div className="mt-0.5 text-[13px] text-[#718096]">
                    Hạn: {formatDateTimeVi(assignment.dueDate)}
                    {assignment.submission.teacherComment
                      ? ` | Nhận xét: ${assignment.submission.teacherComment}`
                      : ''}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/student/assignments?open=${assignment.id}`)
                    }
                    className="mt-1.5 inline-flex items-center rounded-[10px] bg-[#EAF6FD] px-3 py-1.5 text-[13px] font-semibold text-[#2878B8] transition hover:brightness-95"
                  >
                    Mở bài
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[14px] text-[#718096]">
              Chưa có bài tập nào được giao.
            </p>
          )}
        </section>

        {/* Cột phải: Lịch học tuần này & Tài liệu mới */}
        <div className="grid grid-cols-1 gap-4">
          <section className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
            <h2 className="text-[17px] font-bold text-[#243B53]">
              Lịch học và hạn nộp tuần này
            </h2>

            {weeklyTimelineItems.length > 0 ? (
              <div className="divide-y divide-[#DCEAF3]">
                {weeklyTimelineItems.map((item, idx) => (
                  <div
                    key={`${item.label}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-[13px] last:pb-0"
                  >
                    <span>{item.label}</span>
                    {item.isDeadline ? (
                      <PortalChip label="Hạn nộp" variant="or" />
                    ) : item.lessonType ? (
                      <LessonTypeChip type={item.lessonType} />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[14px] text-[#718096]">
                Tuần này không có lịch.
              </p>
            )}

            <Link
              to="/student/schedule"
              className="mt-2.5 inline-flex items-center rounded-[10px] bg-[#EAF6FD] px-3 py-1.5 text-[13px] font-semibold text-[#2878B8] transition hover:brightness-95"
            >
              Xem thời khóa biểu
            </Link>
          </section>

          <section className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
            <h2 className="text-[17px] font-bold text-[#243B53]">
              Tài liệu mới
            </h2>
            {latestLessonWithDocs ? (
              <>
                <p className="mb-2 mt-1 text-[13px] text-[#718096]">
                  Buổi {latestLessonWithDocs.sessionNumber}:{' '}
                  {latestLessonWithDocs.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {latestLessonWithDocs.resources.map((doc) => (
                    <ResourceDocChip key={doc.id} resource={doc} />
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 text-[14px] text-[#718096]">
                Chưa có tài liệu.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
