import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  useCreateSupportRequestMutation,
  useStudentPortalData,
} from '../hooks/useStudentPortal';
import { NoEnrollmentCard } from '../components/NoEnrollmentCard';
import { PortalChip, PortalProgressBar } from '../components/PortalUiBits';
import { usePortalToast } from '../components/portalToastContext';
import {
  SUPPORT_REQUEST_CATEGORIES,
  validateSupportRequestInput,
} from '../model/studentPortal.schema';
import {
  TOEIC_PART_LABELS,
  type ExamPartAccuracy,
  type SupportRequestType,
  type ToeicPartKey,
} from '../model/studentPortal.types';
import { formatFullDateVi } from '../utils/portalDateUtils';

const LISTENING_PARTS: ToeicPartKey[] = ['p1', 'p2', 'p3', 'p4'];
const READING_PARTS: ToeicPartKey[] = ['p5', 'p6', 'p7s', 'p7d', 'p7t'];

export function StudentExamResultsPage() {
  const { showToast } = usePortalToast();
  const { data, isLoading, isError } = useStudentPortalData();
  const createSupportMutation = useCreateSupportRequestMutation();

  const [activeModalType, setActiveModalType] =
    useState<SupportRequestType | null>(null);
  const [reason, setReason] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeModalType) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModalType(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalType]);

  if (isLoading) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[14px] border border-[#DCEAF3] bg-white p-8 text-[#718096]">
        <Loader2 className="h-7 w-7 animate-spin text-[#2878B8]" />
        <p className="mt-2.5 text-[14px]">Đang tải kết quả thi Mid &amp; Final...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-6 text-center text-[#B93A2E]">
        Không thể tải kết quả thi. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!data.hasEnrollment || !data.classInfo) {
    return <NoEnrollmentCard studentName={data.student.fullName} />;
  }

  const { examResults, supportRequests } = data;
  const entryTotal = examResults.entryScore.total;
  const goalTotal = examResults.goalScore.total;
  const midTerm = examResults.midTerm;
  const finalTerm = examResults.finalTerm;

  const renderPartCell = (partData?: ExamPartAccuracy) => {
    if (!partData) {
      return <span className="text-[#718096]">Chưa có</span>;
    }
    const percent = Math.round((partData.correct / partData.total) * 100);
    return (
      <div>
        <span>
          {partData.correct}/{partData.total} ({percent}%)
        </span>
        <PortalProgressBar percent={percent} />
      </div>
    );
  };

  const renderPartTable = (partKeys: ToeicPartKey[]) => (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#DCEAF3] text-[#243B53]">
            <th className="p-2.5 font-bold">Phần</th>
            <th className="p-2.5 font-bold">Middle Test</th>
            <th className="p-2.5 font-bold">Final Test</th>
          </tr>
        </thead>
        <tbody>
          {partKeys.map((key) => (
            <tr
              key={key}
              className="border-b border-[#DCEAF3] align-top last:border-b-0"
            >
              <td className="p-2.5">{TOEIC_PART_LABELS[key]}</td>
              <td className="p-2.5">{renderPartCell(midTerm?.parts[key])}</td>
              <td className="p-2.5">{renderPartCell(finalTerm?.parts[key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const progressBars: Array<[string, number | null]> = [
    ['Đầu vào', entryTotal],
    ['Middle Test', midTerm?.totalScore ?? null],
    ['Final Test', finalTerm?.totalScore ?? null],
    ['Mục tiêu', goalTotal],
  ];

  const handleOpenModal = (type: SupportRequestType) => {
    setActiveModalType(type);
    setReason('');
    setContent('');
    setContact('');
    setModalError(null);
  };

  const handleSendSupportRequest = async () => {
    if (!activeModalType) return;
    const err = validateSupportRequestInput({ reason, content });
    if (err) {
      setModalError(err);
      return;
    }

    await createSupportMutation.mutateAsync({
      type: activeModalType,
      reason,
      content,
      contact,
    });

    setActiveModalType(null);
    showToast('Đã gửi yêu cầu. Trạng thái: Chờ tiếp nhận.');
  };

  const activeCategory = activeModalType
    ? SUPPORT_REQUEST_CATEGORIES[activeModalType]
    : null;

  return (
    <div>
      {/* 1. Ba khu vực tổng quan */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <span className="text-[13px] text-[#718096]">
            Hồ sơ và điểm đầu vào
          </span>
          <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
            {entryTotal}/990
          </b>
          <span className="text-[13px] text-[#243B53]">
            LC {examResults.entryScore.lc}, RC {examResults.entryScore.rc}. Mục
            tiêu LC {examResults.goalScore.lc}, RC {examResults.goalScore.rc},
            tổng {goalTotal}
          </span>
        </div>

        <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <span className="text-[13px] text-[#718096]">
            Middle Test
            {midTerm ? `, ${formatFullDateVi(midTerm.examDate)}` : ''}
          </span>
          <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
            {midTerm ? `${midTerm.totalScore}/990` : 'Chưa có'}
          </b>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            {midTerm ? (
              <>
                <span className="text-[13px] text-[#243B53]">
                  LC {midTerm.lcScore}, RC {midTerm.rcScore}
                </span>
                <PortalChip label="Đã có kết quả" variant="ok" />
              </>
            ) : (
              <span className="text-[13px] text-[#718096]">
                Kết quả sẽ hiển thị sau khi giáo viên cập nhật.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <span className="text-[13px] text-[#718096]">
            Final Test
            {examResults.expectedFinalDate
              ? `, dự kiến ${formatFullDateVi(examResults.expectedFinalDate)}`
              : ''}
          </span>
          <b className="block text-[26px] font-bold leading-[1.25] text-[#243B53]">
            {finalTerm ? `${finalTerm.totalScore}/990` : 'Chưa có'}
          </b>
          <span className="text-[13px] text-[#243B53]">
            {finalTerm
              ? `LC ${finalTerm.lcScore}, RC ${finalTerm.rcScore}`
              : 'Kết quả sẽ hiển thị sau khi giáo viên cập nhật.'}
          </span>
        </div>
      </div>

      {/* 2. Phân tích Listening & Reading */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <h2 className="text-[17px] font-bold text-[#243B53]">
            Phân tích Listening
          </h2>
          {renderPartTable(LISTENING_PARTS)}
        </section>

        <section className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
          <h2 className="text-[17px] font-bold text-[#243B53]">
            Phân tích Reading
          </h2>
          {renderPartTable(READING_PARTS)}
        </section>
      </div>

      {/* 3. Biểu đồ tiến bộ điểm tổng */}
      <section className="mt-4 rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
        <h2 className="text-[17px] font-bold text-[#243B53]">
          Tiến bộ điểm tổng (thang 990)
        </h2>

        <div className="mt-2.5 space-y-2.5">
          {progressBars.map(([label, score]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-[13px]">
                <span>{label}</span>
                <b>{score ?? 'Chưa có'}</b>
              </div>
              <PortalProgressBar
                percent={score ? Math.round((score / 990) * 100) : 0}
              />
            </div>
          ))}
        </div>

        <p className="mt-4 text-[13px] text-[#718096]">
          Điểm do giáo viên nhập. Hệ thống không tự quy đổi điểm chính thức.
        </p>
      </section>

      {/* 4. Hỗ trợ sau khóa học */}
      <section className="mt-4 rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]">
        <h2 className="text-[17px] font-bold text-[#243B53]">
          Hỗ trợ sau khóa học
        </h2>

        <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(SUPPORT_REQUEST_CATEGORIES).map((cat) => (
            <div
              key={cat.type}
              className="rounded-[14px] border border-[#DCEAF3] bg-white p-[18px]"
            >
              <h3 className="text-[15.5px] font-bold text-[#243B53]">
                {cat.title}
              </h3>
              <p className="mb-2.5 mt-1 text-[13px] text-[#718096]">
                {cat.description}
              </p>
              <button
                type="button"
                onClick={() => handleOpenModal(cat.type)}
                className="inline-flex items-center rounded-[10px] bg-[#2878B8] px-3 py-1.5 text-[13px] font-semibold text-white transition hover:brightness-110"
              >
                Gửi yêu cầu
              </button>
            </div>
          ))}
        </div>

        <h3 className="mt-[18px] text-[15.5px] font-bold text-[#243B53]">
          Yêu cầu đã gửi
        </h3>
        {supportRequests.length > 0 ? (
          <div className="mt-1 divide-y divide-[#DCEAF3]">
            {supportRequests.map((req) => (
              <div key={req.id} className="py-3 text-[13px] last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <b>{SUPPORT_REQUEST_CATEGORIES[req.type].title}</b>
                  <PortalChip label="Chờ tiếp nhận" variant="wn" />
                </div>
                <div className="mt-0.5 text-[#718096]">
                  {req.createdAt} | {req.reason}: {req.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-[13px] text-[#718096]">
            Bạn chưa gửi yêu cầu nào.
          </p>
        )}
      </section>

      {/* Modal gửi yêu cầu hỗ trợ */}
      {activeCategory ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveModalType(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#14283C]/55 p-4"
        >
          <div className="max-h-[calc(100vh-32px)] w-full max-w-[520px] overflow-auto rounded-[14px] bg-white p-5 shadow-xl">
            <h2 className="text-[17px] font-bold text-[#243B53]">
              {activeCategory.title}
            </h2>
            <p className="mb-3 mt-1 text-[13px] text-[#718096]">
              {activeCategory.description}
            </p>

            <label className="block text-[13px] text-[#718096]">
              Loại yêu cầu
              <input
                type="text"
                value={activeCategory.title}
                disabled
                className="mt-1 w-full rounded-[10px] border border-[#DCEAF3] bg-[#F5FAFE] px-3 py-2 text-[15px] text-[#243B53]"
              />
            </label>

            <label className="mt-2.5 block text-[13px] text-[#718096]">
              Lý do
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-2 text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
              >
                <option value="">Chọn lý do</option>
                {activeCategory.reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-2.5 block text-[13px] text-[#718096]">
              Nội dung
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mô tả ngắn gọn yêu cầu của bạn"
                className="mt-1 w-full rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-2 text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
              />
            </label>

            <label className="mt-2.5 block text-[13px] text-[#718096]">
              Thông tin liên hệ (nếu cần)
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Số điện thoại hoặc email"
                className="mt-1 w-full rounded-[10px] border border-[#DCEAF3] bg-white px-3 py-2 text-[15px] text-[#243B53] outline-none focus:border-[#75BDEB]"
              />
            </label>

            <span className="mt-1 block min-h-[18px] text-[13px] text-[#B93A2E]">
              {modalError ?? ''}
            </span>

            <div className="mt-1 flex items-center gap-2.5">
              <button
                type="button"
                disabled={createSupportMutation.isPending}
                onClick={handleSendSupportRequest}
                className="inline-flex items-center rounded-[10px] bg-[#2878B8] px-4 py-2 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                Gửi yêu cầu
              </button>

              <button
                type="button"
                onClick={() => setActiveModalType(null)}
                className="inline-flex items-center rounded-[10px] bg-[#EAF6FD] px-4 py-2 text-[15px] font-semibold text-[#2878B8] transition hover:brightness-95"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
