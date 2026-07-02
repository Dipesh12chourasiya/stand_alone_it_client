
// ─── Style map ───────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  Pending:
    'bg-neutral-50 text-neutral-500 ring-1 ring-inset ring-neutral-200',
  Scheduled:
    'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  InProgress:
    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  Completed:
    'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Cancelled:
    'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const statusLabels: Record<string, string> = {
  Pending: 'Pending',
  Scheduled: 'Scheduled',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

// ─── Component ───────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
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
