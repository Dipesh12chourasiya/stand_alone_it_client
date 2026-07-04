import { Link } from 'react-router-dom';
import type { RecentInterview } from '../types/dashboard.types';

interface RecentInterviewsTableProps {
  interviews: RecentInterview[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Scheduled: 'bg-blue-50 text-blue-700',
    Completed: 'bg-green-50 text-green-700',
    Cancelled: 'bg-neutral-50 text-neutral-500',
    InProgress: 'bg-amber-50 text-amber-700',
    Pending: 'bg-neutral-50 text-neutral-500',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? 'bg-neutral-50 text-neutral-500'
      }`}
    >
      {status}
    </span>
  );
}

export function RecentInterviewsTable({
  interviews,
  isLoading,
  isError,
}: RecentInterviewsTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-red-600">
          Failed to load recent interviews.
        </p>
      </div>
    );
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-neutral-400">No interviews yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-900">
          Recent Interviews
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <Th>Title</Th>
              <Th className="hidden sm:table-cell">Candidate</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {interviews.map((interview) => (
              <tr key={interview._id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-3 pr-4">
                  <span className="text-sm font-medium text-neutral-900">
                    {interview.title}
                  </span>
                </td>
                <td className="hidden py-3 pr-4 sm:table-cell">
                  <span className="text-sm text-neutral-600">
                    {interview.candidateName}
                  </span>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <span className="text-sm text-neutral-600">
                    {formatDate(interview.date)}
                  </span>
                  <span className="ml-1.5 text-xs text-neutral-400">
                    {interview.time}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <StatusPill status={interview.status} />
                </td>
                <td className="py-3 text-right">
                  <Link
                    to={`/interviews/${interview._id}`}
                    className="rounded-lg px-2.5 py-1 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-0 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 ${className}`}
    >
      {children}
    </th>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
      <div className="mt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-neutral-50" />
        ))}
      </div>
    </div>
  );
}
