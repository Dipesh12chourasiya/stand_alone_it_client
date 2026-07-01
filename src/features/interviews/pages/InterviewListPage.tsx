import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useInterviewList, useDeleteInterview } from '../hooks/useInterviews';
import { InterviewTable } from '../components/InterviewTable';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type {
  InterviewStatus,
  MeetingPlatform,
  SortOption,
} from '../types/interview.types';

// ─── Sort options ────────────────────────────────────────────

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'date', label: 'By interview date' },
];

// ─── Page ────────────────────────────────────────────────────

export function InterviewListPage() {
  // Search & filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | undefined>();
  const [platformFilter, setPlatformFilter] = useState<MeetingPlatform | undefined>();
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteInterview();

  // Query
  const { data, isLoading, isError, error } = useInterviewList({
    page,
    limit: 10,
    search: debouncedSearch,
    status: statusFilter,
    platform: platformFilter,
    sort,
  });

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: InterviewStatus | undefined) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handlePlatformChange = useCallback(
    (value: MeetingPlatform | undefined) => {
      setPlatformFilter(value);
      setPage(1);
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setStatusFilter(undefined);
    setPlatformFilter(undefined);
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  }, [deleteId, deleteMutation]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Interviews
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage and monitor your interview sessions.
          </p>
        </div>
        <Link
          to="/interviews/new"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New interview
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm">
          <SearchBar value={search} onChange={(v) => {
            setSearch(v);
            handleSearchChange(v);
          }} />
        </div>

        <div className="flex items-center gap-3">
          <FilterPanel
            status={statusFilter}
            platform={platformFilter}
            onStatusChange={handleStatusChange}
            onPlatformChange={handlePlatformChange}
            onClear={handleClearFilters}
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
            aria-label="Sort interviews"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">
            Failed to load interviews.
          </p>
          <p className="mt-1 text-sm text-red-500">
            {(error as { message?: string })?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : data && data.interviews.length > 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
          <InterviewTable
            interviews={data.interviews}
            pagination={data.pagination}
            sort={sort}
            onSortChange={setSort}
            onPageChange={setPage}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <EmptyState
          title={
            debouncedSearch || statusFilter || platformFilter
              ? 'No interviews match your filters'
              : 'No interviews yet'
          }
          message={
            debouncedSearch || statusFilter || platformFilter
              ? 'Try adjusting your search or filters.'
              : 'Create your first interview to get started.'
          }
          actionTo={
            debouncedSearch || statusFilter || platformFilter ? undefined : '/interviews/new'
          }
          actionLabel="Create interview"
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete interview"
        message={
          <p>
            Are you sure you want to delete this interview? This action
            cannot be undone.
          </p>
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
