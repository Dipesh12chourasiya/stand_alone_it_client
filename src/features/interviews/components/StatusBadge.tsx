import type { InterviewStatus } from '../types/interview.types';

// ─── Style map ───────────────────────────────────────────────

const statusStyles: Record<InterviewStatus, string> = {
  Scheduled:
    'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Completed:
    'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Cancelled:
    'bg-neutral-50 text-neutral-500 ring-1 ring-inset ring-neutral-200',
};

const statusLabels: Record<InterviewStatus, string> = {
  Scheduled: 'Scheduled',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

// ─── Component ───────────────────────────────────────────────

interface StatusBadgeProps {
  status: InterviewStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
