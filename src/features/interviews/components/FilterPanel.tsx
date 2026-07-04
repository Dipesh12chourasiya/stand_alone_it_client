import { MEETING_PLATFORMS, INTERVIEW_STATUSES } from '../types/interview.types';
import type { InterviewStatus, MeetingPlatform } from '../types/interview.types';

// ─── Props ───────────────────────────────────────────────────

interface FilterPanelProps {
  status: InterviewStatus | undefined;
  platform: MeetingPlatform | undefined;
  onStatusChange: (value: InterviewStatus | undefined) => void;
  onPlatformChange: (value: MeetingPlatform | undefined) => void;
  onClear: () => void;
}

// ─── Option helpers ──────────────────────────────────────────

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...INTERVIEW_STATUSES.map((s) => ({ value: s, label: s })),
];

const platformOptions = [
  { value: '', label: 'All platforms' },
  ...MEETING_PLATFORMS.map((p) => ({ value: p, label: p })),
];

// ─── Component ───────────────────────────────────────────────

export function FilterPanel({
  status,
  platform,
  onStatusChange,
  onPlatformChange,
  onClear,
}: FilterPanelProps) {
  const hasFilters = status !== undefined || platform !== undefined;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[160px]">
        <select
          value={status ?? ''}
          onChange={(e) =>
            onStatusChange(
              e.target.value === '' ? undefined : (e.target.value as InterviewStatus),
            )
          }
          className="block w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition-colors duration-150 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
          aria-label="Filter by status"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[160px]">
        <select
          value={platform ?? ''}
          onChange={(e) =>
            onPlatformChange(
              e.target.value === ''
                ? undefined
                : (e.target.value as MeetingPlatform),
            )
          }
          className="block w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition-colors duration-150 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
          aria-label="Filter by platform"
        >
          {platformOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
