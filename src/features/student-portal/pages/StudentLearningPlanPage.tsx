import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Printer } from 'lucide-react';
import { useStudentPortalData } from '../hooks/useStudentPortal';
import { NoEnrollmentCard } from '../components/NoEnrollmentCard';
import { LessonTypeChip, ResourceDocChip } from '../components/PortalUiBits';
import {
  formatDateTimeVi,
  formatShortWeekdayDate,
} from '../utils/portalDateUtils';

export function StudentLearningPlanPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useStudentPortalData();

  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  const maxWeekIndex = useMemo(() => {
    const lessons = data?.lessons;
    if (!lessons || lessons.length === 0) return 0;
    return Math.max(...lessons.map((s) => s.weekIndex));
  }, [data]);

  const filteredLessons = useMemo(() => {
    const lessons = data?.lessons;
    if (!lessons) return [];
    const q = searchQuery.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const weekMatch =
        selectedWeek === 'all' || lesson.weekIndex === Number(selectedWeek);
      if (!weekMatch) return false;
      if (!q) return true;

      const haystack = [
        lesson.title,
        lesson.lcContent,
        lesson.rcContent,
        ...lesson.resources.map((r) => r.title),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [data, searchQuery, selectedWeek]);

  if (isLoading) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[14px] border border-[#DCEAF3] bg-white p-8 text-[#718096]">
        <Loader2 className="h-7 w-7 animate-spin text-[#2878B8]" />
        <p className="mt-2.5 text-[14px]">
          Đang tải tài liệu và kế hoạch học tập...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-6 text-center text-[#B93A2E]">
        Không thể tải kế hoạch học tập. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!data.hasEnrollment || !data.classInfo) {
    return <NoEnrollmentCard studentName={data.student.fullName} />;
  }

  const assignmentBySession = new Map(
    data.assignments.map((a) => [a.sessionNumber, a])
  );

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // ignore print error
    }
  };

  return (
    <div>
      {/* 1. Thanh công cụ */}
      <div className="no-print flex flex-wrap items-center gap-2.5">
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          aria-label="Lọc theo tuần"
          className="min-w-[150px] flex-1 rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-[9px] text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
        >
          <option value="all">Tất cả các tuần</option>
          {Array.from({ length: maxWeekIndex + 1 }, (_, w) => (
            <option key={w} value={String(w)}>
              Tuần {w + 1}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo nội dung, tài liệu..."
          aria-label="Tìm kiếm"
          className="min-w-[150px] flex-1 rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-[9px] text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
        />

        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
            viewMode === 'list'
              ? 'border-[#2878B8] bg-[#2878B8] text-white'
              : 'border-[#DCEAF3] bg-white text-[#243B53] hover:bg-[#EAF6FD]'
          }`}
        >
          Danh sách
        </button>

        <button
          type="button"
          onClick={() => setViewMode('table')}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
            viewMode === 'table'
              ? 'border-[#2878B8] bg-[#2878B8] text-white'
              : 'border-[#DCEAF3] bg-white text-[#243B53] hover:bg-[#EAF6FD]'
          }`}
        >
          Bảng tổng hợp
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#2878B8] px-3 py-1.5 text-[13px] font-semibold text-white transition hover:brightness-110"
        >
          <Printer className="h-4 w-4" />
          <span>In kế hoạch</span>
        </button>
      </div>

      {/* 2. Tài liệu chung của khóa */}
      <section className="print-card mt-4 rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
        <h2 className="text-[17px] font-bold text-[#243B53]">
          Tài liệu chung của khóa
        </h2>
        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
          {data.generalResources.map((doc) => (
            <ResourceDocChip key={doc.id} resource={doc} />
          ))}
        </div>
      </section>

      <p className="mt-4 text-[13px] text-[#718096]">
        {filteredLessons.length} buổi. Bấm vào tên tài liệu để mở link trong tab
        mới.
      </p>

      {/* 3. Danh sách buổi học hoặc Bảng tổng hợp */}
      <div className="mt-4 grid grid-cols-1 gap-4">
        {filteredLessons.length === 0 ? (
          <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
            <b className="text-[15px] font-bold text-[#243B53]">
              Không tìm thấy buổi học phù hợp.
            </b>
            <p className="mt-1 text-[14px] text-[#718096]">
              Hãy bỏ bộ lọc tuần hoặc đổi từ khóa.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="print-card overflow-x-auto rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
            <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#DCEAF3] text-[#243B53]">
                  <th className="p-2.5 font-bold">Tuần</th>
                  <th className="p-2.5 font-bold">Buổi</th>
                  <th className="p-2.5 font-bold">Ngày</th>
                  <th className="p-2.5 font-bold">Nội dung</th>
                  <th className="p-2.5 font-bold">BTVN</th>
                  <th className="p-2.5 font-bold">Hạn nộp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => {
                  const assignment = assignmentBySession.get(
                    lesson.sessionNumber
                  );
                  return (
                    <tr
                      key={lesson.id}
                      className="border-b border-[#DCEAF3] align-top last:border-b-0"
                    >
                      <td className="p-2.5">{lesson.weekIndex + 1}</td>
                      <td className="p-2.5">{lesson.sessionNumber}</td>
                      <td className="p-2.5">
                        {formatShortWeekdayDate(lesson.date)}
                      </td>
                      <td className="p-2.5">
                        <span className="mr-2">{lesson.title}</span>
                        <LessonTypeChip type={lesson.type} />
                      </td>
                      <td className="p-2.5">
                        {assignment ? assignment.code : 'Không có'}
                      </td>
                      <td className="p-2.5">
                        {assignment
                          ? formatDateTimeVi(assignment.dueDate)
                          : 'Không có'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const assignment = assignmentBySession.get(lesson.sessionNumber);
            const isExpanded = expandedSession === lesson.sessionNumber;

            return (
              <article
                key={lesson.id}
                className="print-card rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <div className="text-[13px] text-[#718096]">
                      Tuần {lesson.weekIndex + 1}, buổi {lesson.sessionNumber},{' '}
                      {formatShortWeekdayDate(lesson.date)}
                    </div>
                    <h3 className="text-[15.5px] font-bold text-[#243B53]">
                      {lesson.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <LessonTypeChip type={lesson.type} />
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedSession((prev) =>
                          prev === lesson.sessionNumber
                            ? null
                            : lesson.sessionNumber
                        )
                      }
                      className="no-print inline-flex items-center rounded-[10px] bg-[#EAF6FD] px-3 py-1.5 text-[13px] font-semibold text-[#2878B8] transition hover:brightness-95"
                    >
                      {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                    </button>
                  </div>
                </div>

                {/* Nội dung chi tiết buổi học */}
                <div
                  className={`print-expand ${
                    isExpanded ? 'block' : 'hidden'
                  } mt-3 border-t border-[#DCEAF3] pt-2`}
                >
                  <h4 className="mb-0.5 mt-2.5 text-[14px] font-bold text-[#243B53]">
                    I. Listening Comprehension (LC)
                  </h4>
                  <p className="text-[15px] text-[#243B53]">
                    {lesson.lcContent}
                  </p>

                  <h4 className="mb-0.5 mt-3 text-[14px] font-bold text-[#243B53]">
                    II. Reading Comprehension (RC)
                  </h4>
                  <p className="text-[15px] text-[#243B53]">
                    {lesson.rcContent}
                  </p>

                  {lesson.resources.length > 0 ? (
                    <>
                      <h4 className="mb-1.5 mt-3 text-[14px] font-bold text-[#243B53]">
                        Tài liệu
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {lesson.resources.map((doc) => (
                          <ResourceDocChip key={doc.id} resource={doc} />
                        ))}
                      </div>
                    </>
                  ) : null}

                  {assignment ? (
                    <>
                      <h4 className="mb-1 mt-3 text-[14px] font-bold text-[#243B53]">
                        Bài tập về nhà
                      </h4>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[14px] text-[#243B53]">
                          {assignment.code}, hạn{' '}
                          {formatDateTimeVi(assignment.dueDate)}
                        </span>
                        {assignment.isUnlocked ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/student/assignments?open=${assignment.id}`
                              )
                            }
                            className="no-print inline-flex items-center rounded-[10px] bg-[#EAF6FD] px-3 py-1.5 text-[13px] font-semibold text-[#2878B8] transition hover:brightness-95"
                          >
                            Mở bài
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
