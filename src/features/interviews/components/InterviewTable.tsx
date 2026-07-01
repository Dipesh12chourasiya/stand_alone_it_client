import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import type { Interview, PaginationMeta } from '../types/interview.types';
import type { SortOption } from '../types/interview.types';
import { Pagination } from './Pagination';

// ─── Props ───────────────────────────────────────────────────

interface InterviewTableProps {
  interviews: Interview[];
  pagination: PaginationMeta;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Component ───────────────────────────────────────────────

export function InterviewTable({
  interviews,
  pagination,
  sort,
  onSortChange,
  onPageChange,
  onDelete,
}: InterviewTableProps) {
  return (
    <div>
      {/* Table (desktop) */}
      <div className="hidden sm:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <Th>Title</Th>
              <Th className="hidden md:table-cell">Candidate</Th>
              <Th className="hidden lg:table-cell">Platform</Th>
              <Th sortable onSortChange={() => onSortChange('date')} active={sort === 'date'}>
                Date
              </Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {interviews.map((interview) => (
              <tr key={interview.id} className="group hover:bg-neutral-50 transition-colors">
                <td className="py-3.5 pr-4">
                  <Link
                    to={`/interviews/${interview.id}`}
                    className="text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
                  >
                    {interview.title}
                  </Link>
                </td>
                <td className="hidden py-3.5 pr-4 md:table-cell">
                  <div className="text-sm text-neutral-700">{interview.candidateName}</div>
                  <div className="text-xs text-neutral-400">{interview.candidateEmail}</div>
                </td>
                <td className="hidden py-3.5 pr-4 lg:table-cell">
                  <span className="text-sm text-neutral-600">{interview.meetingPlatform}</span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-sm text-neutral-700">{formatDate(interview.date)}</span>
                  <div className="text-xs text-neutral-400">{interview.time}</div>
                </td>
                <td className="py-3.5 pr-4">
                  <StatusBadge status={interview.status} />
                </td>
                <td className="py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/interviews/${interview.id}`}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                    >
                      View
                    </Link>
                    <Link
                      to={`/interviews/${interview.id}/edit`}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(interview.id)}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout (mobile) */}
      <div className="space-y-3 sm:hidden">
        {interviews.map((interview) => (
          <div
            key={interview.id}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  to={`/interviews/${interview.id}`}
                  className="text-sm font-medium text-neutral-900 hover:text-neutral-600"
                >
                  {interview.title}
                </Link>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {interview.candidateName}
                </p>
              </div>
              <StatusBadge status={interview.status} />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
              <div className="text-xs text-neutral-400">
                {formatDate(interview.date)} &middot; {interview.time}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/interviews/${interview.id}/edit`}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(interview.id)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

// ─── Table header cell ───────────────────────────────────────

function Th({
  children,
  className = '',
  sortable,
  onSortChange,
  active,
}: {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  onSortChange?: () => void;
  active?: boolean;
}) {
  const base = 'px-0 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500';

  if (!sortable) {
    return <th className={`${base} ${className}`}>{children}</th>;
  }

  return (
    <th className={`${base} ${className}`}>
      <button
        type="button"
        onClick={onSortChange}
        className={`inline-flex items-center gap-1 transition-colors hover:text-neutral-700 cursor-pointer ${active ? 'text-neutral-700' : ''}`}
      >
        {children}
        <svg
          className={`h-3 w-3 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      </button>
    </th>
  );
}
