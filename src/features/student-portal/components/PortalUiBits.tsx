import type {
  AssignmentSubmissionStatus,
  AttendanceStatus,
  LearningResource,
  LessonActivityType,
} from '../model/studentPortal.types';
import {
  ASSIGNMENT_STATUS_LABELS,
  ATTENDANCE_STATUS_LABELS,
  LESSON_ACTIVITY_LABELS,
} from '../model/studentPortal.types';

export type PortalChipVariant = 'ok' | 'wn' | 'bad' | 'bl' | 'or' | 'muted';

const CHIP_STYLES: Record<PortalChipVariant, string> = {
  ok: 'bg-[#E4F4EC] text-[#25805A]',
  wn: 'bg-[#FDF1D6] text-[#9A6700]',
  bad: 'bg-[#FBE7E4] text-[#B93A2E]',
  bl: 'bg-[#EAF6FD] text-[#2878B8]',
  or: 'bg-[#FDE9DD] text-[#B34510]',
  muted: 'bg-[#F5FAFE] text-[#718096] border border-[#DCEAF3]',
};

export function PortalChip({
  label,
  variant,
}: {
  label: string;
  variant: PortalChipVariant;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${CHIP_STYLES[variant]}`}
    >
      {label}
    </span>
  );
}

export function LessonTypeChip({ type }: { type: LessonActivityType }) {
  const variant: PortalChipVariant =
    type === 'class' || type === 'review' ? 'bl' : 'or';
  return <PortalChip label={LESSON_ACTIVITY_LABELS[type]} variant={variant} />;
}

export function AssignmentStatusChip({
  status,
}: {
  status: AssignmentSubmissionStatus;
}) {
  const variantMap: Record<AssignmentSubmissionStatus, PortalChipVariant> = {
    todo: 'wn',
    submitted: 'bl',
    passed: 'ok',
    failed: 'bad',
  };
  return (
    <PortalChip
      label={ASSIGNMENT_STATUS_LABELS[status]}
      variant={variantMap[status]}
    />
  );
}

export function AttendanceStatusChip({ status }: { status: AttendanceStatus }) {
  const variantMap: Record<AttendanceStatus, PortalChipVariant> = {
    on: 'ok',
    late: 'wn',
    excused: 'bl',
    absent: 'bad',
    none: 'muted',
  };
  return (
    <PortalChip
      label={ATTENDANCE_STATUS_LABELS[status]}
      variant={variantMap[status]}
    />
  );
}

export function PortalProgressBar({ percent }: { percent: number }) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-[9px] bg-[#EAF6FD]">
      <div
        className="h-full bg-[#75BDEB] transition-all duration-300"
        style={{ width: `${safePercent}%` }}
      />
    </div>
  );
}

export function ResourceDocChip({ resource }: { resource: LearningResource }) {
  if (!resource.url) {
    return (
      <span
        title="Chưa có link"
        className="inline-block rounded-full border border-[#DCEAF3] bg-[#EAF6FD] px-3 py-1 text-[12.5px] font-semibold text-[#718096]"
      >
        {resource.kind}: {resource.title}
      </span>
    );
  }

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Mở ${resource.title} trong tab mới`}
      className="inline-block rounded-full border border-[#DCEAF3] bg-[#EAF6FD] px-3 py-1 text-[12.5px] font-semibold text-[#2878B8] transition-colors hover:border-[#75BDEB] hover:bg-[#A7D8F5]"
    >
      {resource.kind}: {resource.title}
    </a>
  );
}
