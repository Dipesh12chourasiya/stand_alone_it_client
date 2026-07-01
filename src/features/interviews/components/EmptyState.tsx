import { Link } from 'react-router-dom';

// ─── Props ───────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
}

// ─── Component ───────────────────────────────────────────────

export function EmptyState({
  title = 'No interviews yet',
  message = 'Create your first interview to get started.',
  actionLabel = 'Create interview',
  actionTo = '/interviews/new',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
        <svg
          className="h-6 w-6 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{message}</p>

      {actionTo && (
        <Link
          to={actionTo}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
