import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  useStudentPortalData,
  useSubmitDemoScoreMutation,
  useSubmitHomeworkMutation,
} from '../hooks/useStudentPortal';
import { NoEnrollmentCard } from '../components/NoEnrollmentCard';
import {
  AssignmentStatusChip,
  AttendanceStatusChip,
} from '../components/PortalUiBits';
import { usePortalToast } from '../components/portalToastContext';
import {
  validateDemoScoreSubmission,
  validateHomeworkSubmission,
} from '../model/studentPortal.schema';
import type {
  AssignmentWithSubmission,
  AttendanceStatus,
} from '../model/studentPortal.types';
import {
  formatDateTimeVi,
  formatShortWeekdayDate,
} from '../utils/portalDateUtils';

type AssignmentFilterKey =
  | 'all'
  | 'todo'
  | 'done'
  | 'submitted'
  | 'passed'
  | 'failed'
  | 'demo';

const ASSIGNMENT_FILTERS: Array<{ key: AssignmentFilterKey; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'todo', label: 'Cần nộp' },
  { key: 'done', label: 'Đã hoàn thiện' },
  { key: 'submitted', label: 'Chờ kiểm tra' },
  { key: 'passed', label: 'Đã đạt' },
  { key: 'failed', label: 'Chưa đạt' },
  { key: 'demo', label: 'Demo Test' },
];

export function StudentAssignmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = usePortalToast();
  const { data, isLoading, isError } = useStudentPortalData();
  const submitHomeworkMutation = useSubmitHomeworkMutation();
  const submitDemoMutation = useSubmitDemoScoreMutation();

  const tabParam = searchParams.get('tab');
  const openParam = searchParams.get('open');

  const activeTab: 'work' | 'attendance' =
    tabParam === 'attendance' ? 'attendance' : 'work';

  const [filterKey, setFilterKey] = useState<AssignmentFilterKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [manualOpenId, setManualOpenId] = useState<string | null>(null);

  // Form states cho bài đang mở
  const [driveLinkInput, setDriveLinkInput] = useState<string>('');
  const [lcInput, setLcInput] = useState<string>('');
  const [rcInput, setRcInput] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const openAssignmentId = openParam || manualOpenId;

  const populateFormFromAssignment = (item: AssignmentWithSubmission) => {
    setFormError(null);
    if (item.isDemoTest) {
      setLcInput(
        item.submission.demoScores?.lc !== undefined
          ? String(item.submission.demoScores.lc)
          : ''
      );
      setRcInput(
        item.submission.demoScores?.rc !== undefined
          ? String(item.submission.demoScores.rc)
          : ''
      );
      setDriveLinkInput('');
    } else {
      setDriveLinkInput(item.submission.driveLink ?? '');
      setLcInput(
        item.submission.partScores?.lc !== undefined
          ? String(item.submission.partScores.lc)
          : ''
      );
      setRcInput(
        item.submission.partScores?.rc !== undefined
          ? String(item.submission.partScores.rc)
          : ''
      );
    }
  };

  // Khi mở bài từ URL query `?open=B05`, tự cuộn đến thẻ bài tập đó và điền sẵn giá trị hiện tại
  useEffect(() => {
    if (!openParam || !data?.assignments) return;
    const target = data.assignments.find((a) => a.id === openParam);
    if (target) {
      const el = document.getElementById(`c-${target.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [openParam, data?.assignments]);

  const unlockedAssignments = useMemo(() => {
    const assignments = data?.assignments;
    if (!assignments) return [];
    return assignments.filter((a) => a.isUnlocked);
  }, [data]);

  const filteredAssignments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return unlockedAssignments
      .filter((item) => {
        const status = item.submission.status;
        const matchesFilter =
          filterKey === 'all' ||
          (filterKey === 'todo' && status === 'todo') ||
          (filterKey === 'done' && status !== 'todo') ||
          (filterKey === 'submitted' && status === 'submitted') ||
          (filterKey === 'passed' && status === 'passed') ||
          (filterKey === 'failed' && status === 'failed') ||
          (filterKey === 'demo' && item.isDemoTest);

        if (!matchesFilter) return false;
        if (!q) return true;
        return `${item.title} ${item.code}`.toLowerCase().includes(q);
      })
      .sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );
  }, [filterKey, searchQuery, unlockedAssignments]);

  if (isLoading) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[14px] border border-[#DCEAF3] bg-white p-8 text-[#718096]">
        <Loader2 className="h-7 w-7 animate-spin text-[#2878B8]" />
        <p className="mt-2.5 text-[14px]">
          Đang tải danh sách bài tập và điểm danh...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-6 text-center text-[#B93A2E]">
        Không thể tải dữ liệu bài tập. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!data.hasEnrollment || !data.classInfo) {
    return <NoEnrollmentCard studentName={data.student.fullName} />;
  }

  const handleSwitchTab = (tab: 'work' | 'attendance') => {
    if (tab === 'attendance') {
      setSearchParams({ tab: 'attendance' });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenCard = (item: AssignmentWithSubmission) => {
    populateFormFromAssignment(item);
    setManualOpenId(item.id);
    if (openParam) {
      setSearchParams({});
    }
  };

  const handleCloseCard = () => {
    setManualOpenId(null);
    setFormError(null);
    if (openParam) {
      setSearchParams({});
    }
  };

  const handleSaveSubmission = async (item: AssignmentWithSubmission) => {
    setFormError(null);

    if (item.isDemoTest) {
      if (lcInput.trim() === '' || rcInput.trim() === '') {
        setFormError('Hãy nhập đủ điểm LC và RC.');
        return;
      }
      const lcScore = Number(lcInput);
      const rcScore = Number(rcInput);
      const err = validateDemoScoreSubmission({
        assignmentId: item.id,
        lcScore,
        rcScore,
      });
      if (err) {
        setFormError(err);
        return;
      }

      await submitDemoMutation.mutateAsync({
        assignmentId: item.id,
        lcScore,
        rcScore,
      });
      handleCloseCard();
      showToast('Đã lưu. Trạng thái: Chờ kiểm tra.');
      return;
    }

    // BTVN thường
    const lcPart = item.parts?.find((p) => p.key === 'lc');
    const rcPart = item.parts?.find((p) => p.key === 'rc');

    if (lcPart && lcInput.trim() === '') {
      setFormError(`Hãy nhập số câu đúng cho ${lcPart.label}.`);
      return;
    }
    if (rcPart && rcInput.trim() === '') {
      setFormError(`Hãy nhập số câu đúng cho ${rcPart.label}.`);
      return;
    }

    const lcCorrect = Number(lcInput);
    const rcCorrect = Number(rcInput);

    const err = validateHomeworkSubmission(item, {
      assignmentId: item.id,
      driveLink: driveLinkInput,
      lcCorrect,
      rcCorrect,
    });

    if (err) {
      setFormError(err);
      return;
    }

    await submitHomeworkMutation.mutateAsync({
      assignmentId: item.id,
      driveLink: driveLinkInput,
      lcCorrect,
      rcCorrect,
    });
    handleCloseCard();
    showToast('Đã lưu. Trạng thái: Chờ kiểm tra.');
  };

  const countStatus = (st: AssignmentWithSubmission['submission']['status']) =>
    unlockedAssignments.filter((a) => a.submission.status === st).length;

  const countAttendance = (st: AttendanceStatus) =>
    data.attendance.filter((a) => a.status === st).length;

  return (
    <div>
      {/* Chuyển 2 Tab: Nộp BTVN & điền điểm | Lịch sử điểm danh */}
      <div className="no-print flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => handleSwitchTab('work')}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
            activeTab === 'work'
              ? 'border-[#2878B8] bg-[#2878B8] text-white'
              : 'border-[#DCEAF3] bg-white text-[#243B53] hover:bg-[#EAF6FD]'
          }`}
        >
          Nộp BTVN &amp; điền điểm
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab('attendance')}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
            activeTab === 'attendance'
              ? 'border-[#2878B8] bg-[#2878B8] text-white'
              : 'border-[#DCEAF3] bg-white text-[#243B53] hover:bg-[#EAF6FD]'
          }`}
        >
          Lịch sử điểm danh
        </button>
      </div>

      {/* Nội dung từng Tab */}
      <div className="mt-4">
        {activeTab === 'attendance' ? (
          /* TAB B: LỊCH SỬ ĐIỂM DANH */
          <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ['Tổng số buổi', data.lessons.length],
                ['Có mặt', countAttendance('on') + countAttendance('late')],
                ['Nghỉ', countAttendance('excused') + countAttendance('absent')],
                ['Đi muộn', countAttendance('late')],
              ].map(([label, val]) => (
                <div
                  key={String(label)}
                  className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]"
                >
                  <span className="text-[13px] text-[#718096]">{label}</span>
                  <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
                    {val}
                  </b>
                </div>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
              <table className="w-full border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-[#DCEAF3] text-[#243B53]">
                    <th className="p-2.5 font-bold">Buổi</th>
                    <th className="p-2.5 font-bold">Ngày học</th>
                    <th className="p-2.5 font-bold">Nội dung</th>
                    <th className="p-2.5 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendance.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[#DCEAF3] align-top last:border-b-0"
                    >
                      <td className="p-2.5">{record.sessionNumber}</td>
                      <td className="p-2.5">
                        {formatShortWeekdayDate(record.date)}
                      </td>
                      <td className="p-2.5">{record.lessonTitle}</td>
                      <td className="p-2.5">
                        <AttendanceStatusChip status={record.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[13px] text-[#718096]">
              Điểm danh do giáo viên ghi nhận, học viên chỉ xem.
            </p>
          </div>
        ) : (
          /* TAB A: NỘP BTVN & ĐIỀN ĐIỂM */
          <div>
            {/* 1. Thống kê cá nhân */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                ['Tổng số bài', unlockedAssignments.length],
                ['Đã nộp', unlockedAssignments.length - countStatus('todo')],
                ['Đã đạt', countStatus('passed')],
                ['Chưa đạt', countStatus('failed')],
                [
                  'Còn thiếu',
                  unlockedAssignments.filter((a) => a.isOverdue).length,
                ],
              ].map(([label, val]) => (
                <div
                  key={String(label)}
                  className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]"
                >
                  <span className="text-[13px] text-[#718096]">{label}</span>
                  <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
                    {val}
                  </b>
                </div>
              ))}
            </div>

            {/* 2. Bộ lọc & tìm kiếm */}
            <div className="no-print mt-4 flex flex-wrap items-center gap-2.5">
              {ASSIGNMENT_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterKey(f.key)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                    filterKey === f.key
                      ? 'border-[#2878B8] bg-[#2878B8] text-white'
                      : 'border-[#DCEAF3] bg-white text-[#243B53] hover:bg-[#EAF6FD]'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc mã bài"
                aria-label="Tìm bài tập"
                className="w-full max-w-[260px] rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-[9px] text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
              />
            </div>

            {/* 3. Danh sách bài tập */}
            <div className="mt-4 grid grid-cols-1 gap-4">
              {filteredAssignments.length === 0 ? (
                <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
                  <b className="text-[15px] font-bold text-[#243B53]">
                    Không có bài tập phù hợp.
                  </b>
                  <p className="mt-1 text-[14px] text-[#718096]">
                    Hãy chọn bộ lọc khác.
                  </p>
                </div>
              ) : (
                filteredAssignments.map((item) => {
                  const isOpen = openAssignmentId === item.id;
                  const sub = item.submission;
                  const totalCorrect =
                    sub.partScores && item.parts
                      ? sub.partScores.lc + sub.partScores.rc
                      : 0;
                  const totalMax = item.parts
                    ? item.parts.reduce((acc, p) => acc + p.maxQuestions, 0)
                    : 0;

                  return (
                    <article
                      key={item.id}
                      id={`c-${item.id}`}
                      className={`rounded-[14px] border bg-white p-[18px] transition ${
                        isOpen
                          ? 'border-[#75BDEB] shadow-[0_0_0_3px_#EAF6FD]'
                          : 'border-[#DCEAF3]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div>
                          <div className="text-[13px] text-[#718096]">
                            {item.code}, tuần {item.weekIndex + 1}, hạn{' '}
                            {formatDateTimeVi(item.dueDate)}
                            {item.isOverdue ? ' (đã quá hạn)' : ''}
                          </div>
                          <h3 className="text-[15.5px] font-bold text-[#243B53]">
                            {item.title}
                          </h3>
                        </div>

                        <AssignmentStatusChip status={sub.status} />
                      </div>

                      {/* Thông tin đã nộp */}
                      <div className="mt-1.5 space-y-1 text-[13px]">
                        {item.isDemoTest && sub.demoScores ? (
                          <p>
                            LC {sub.demoScores.lc}/495, RC {sub.demoScores.rc}
                            /495, tổng {sub.demoScores.total}/990.{' '}
                            {sub.isConfirmedByTeacher
                              ? 'Điểm đã được giáo viên xác nhận.'
                              : 'Điểm tự nhập, chờ giáo viên xác nhận.'}
                          </p>
                        ) : sub.driveLink ? (
                          <p>
                            Link đã nộp:{' '}
                            <a
                              href={sub.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#718096] underline hover:text-[#2878B8]"
                            >
                              {sub.driveLink
                                .replace(/^https?:\/\//, '')
                                .slice(0, 42)}
                              …
                            </a>
                          </p>
                        ) : null}

                        {sub.partScores && item.parts ? (
                          <p>
                            {item.parts
                              .map(
                                (p) =>
                                  `${p.label}: ${sub.partScores?.[p.key] ?? 0}/${p.maxQuestions}`
                              )
                              .join(', ')}
                            . Tổng {totalCorrect}/{totalMax} (
                            {totalMax
                              ? Math.round((totalCorrect / totalMax) * 100)
                              : 0}
                            %).{' '}
                            {sub.status === 'submitted'
                              ? 'Điểm tự nhập, chờ giáo viên xác nhận.'
                              : 'Điểm đã được giáo viên xác nhận.'}
                          </p>
                        ) : null}

                        {sub.teacherComment ? (
                          <p>
                            <b>Nhận xét:</b> {sub.teacherComment}
                          </p>
                        ) : null}
                      </div>

                      {/* Form nộp bài hoặc Nút mở */}
                      {isOpen ? (
                        <div className="mt-2.5 border-t border-[#DCEAF3] pt-3">
                          {item.isDemoTest ? (
                            <>
                              <div className="flex flex-wrap gap-2.5">
                                <label className="min-w-[150px] flex-1 text-[13px] text-[#718096]">
                                  Điểm LC (0–495)
                                  <input
                                    type="number"
                                    min={0}
                                    max={495}
                                    step={5}
                                    value={lcInput}
                                    onChange={(e) => setLcInput(e.target.value)}
                                    className="mt-1 w-full rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-2 text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
                                  />
                                </label>

                                <label className="min-w-[150px] flex-1 text-[13px] text-[#718096]">
                                  Điểm RC (0–495)
                                  <input
                                    type="number"
                                    min={0}
                                    max={495}
                                    step={5}
                                    value={rcInput}
                                    onChange={(e) => setRcInput(e.target.value)}
                                    className="mt-1 w-full rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-2 text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
                                  />
                                </label>
                              </div>
                              <p className="mt-1.5 text-[13px] text-[#718096]">
                                Đây là điểm bạn tự nhập, trạng thái “Chờ kiểm
                                tra” cho đến khi giáo viên xác nhận. Chưa có
                                bảng quy đổi chính thức nên điểm chỉ để tham
                                khảo.
                              </p>
                            </>
                          ) : (
                            <>
                              <label className="block text-[13px] text-[#718096]">
                                Link Google Drive bài nộp
                                <input
                                  type="url"
                                  value={driveLinkInput}
                                  onChange={(e) =>
                                    setDriveLinkInput(e.target.value)
                                  }
                                  placeholder="https://drive.google.com/..."
                                  className="mt-1 w-full rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-2 text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
                                />
                              </label>

                              <div className="mt-2.5 flex flex-wrap gap-2.5">
                                {item.parts?.map((part) => (
                                  <label
                                    key={part.key}
                                    className="min-w-[150px] flex-1 text-[13px] text-[#718096]"
                                  >
                                    {part.label}: số câu đúng (0–
                                    {part.maxQuestions})
                                    <input
                                      type="number"
                                      min={0}
                                      max={part.maxQuestions}
                                      step={1}
                                      value={
                                        part.key === 'lc' ? lcInput : rcInput
                                      }
                                      onChange={(e) =>
                                        part.key === 'lc'
                                          ? setLcInput(e.target.value)
                                          : setRcInput(e.target.value)
                                      }
                                      className="mt-1 w-full rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-2 text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
                                    />
                                  </label>
                                ))}
                              </div>

                              <p className="mt-1.5 text-[13px] text-[#718096]">
                                Điểm bạn nhập sẽ ở trạng thái “Chờ kiểm tra” cho
                                đến khi giáo viên xác nhận.
                              </p>
                            </>
                          )}

                          <span className="mt-1 block min-h-[18px] text-[13px] text-[#B93A2E]">
                            {formError ?? ''}
                          </span>

                          <div className="mt-1 flex items-center gap-2.5">
                            <button
                              type="button"
                              disabled={
                                submitHomeworkMutation.isPending ||
                                submitDemoMutation.isPending
                              }
                              onClick={() => handleSaveSubmission(item)}
                              className="inline-flex items-center rounded-[10px] bg-[#2878B8] px-3 py-1.5 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                            >
                              {item.isDemoTest ? 'Lưu điểm' : 'Lưu bài nộp'}
                            </button>

                            <button
                              type="button"
                              onClick={handleCloseCard}
                              className="inline-flex items-center rounded-[10px] bg-[#EAF6FD] px-3 py-1.5 text-[13px] font-semibold text-[#2878B8] transition hover:brightness-95"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : sub.status !== 'passed' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCard(item)}
                          className="mt-2 inline-flex items-center rounded-[10px] bg-[#2878B8] px-3 py-1.5 text-[13px] font-semibold text-white transition hover:brightness-110"
                        >
                          {sub.status === 'todo'
                            ? item.isDemoTest
                              ? 'Điền điểm'
                              : 'Nộp bài'
                            : 'Chỉnh sửa'}
                        </button>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
