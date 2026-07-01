import type { PaginationMeta } from '../types/interview.types';

// ─── Props ───────────────────────────────────────────────────

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

// ─── Component ───────────────────────────────────────────────

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = pagination;

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  const btnBase =
    'inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer';

  const btnActive = 'bg-neutral-900 text-white';
  const btnInactive = 'text-neutral-600 hover:bg-neutral-100';
  const btnDisabled = 'text-neutral-300 cursor-not-allowed';

  return (
    <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
      <p className="text-sm text-neutral-500">
        Showing page {page} of {totalPages} ({total} total)
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${btnBase} ${page <= 1 ? btnDisabled : btnInactive}`}
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center px-2 py-1.5 text-sm text-neutral-400"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btnBase} ${page >= totalPages ? btnDisabled : btnInactive}`}
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
