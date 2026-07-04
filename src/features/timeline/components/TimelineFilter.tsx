import { TIMELINE_EVENT_TYPES, TIMELINE_SEVERITIES } from '../types/timeline.types';
import type { TimelineEventType, TimelineSeverity } from '../types/timeline.types';

interface TimelineFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  severityFilter: TimelineSeverity | '';
  onSeverityChange: (value: TimelineSeverity | '') => void;
  eventTypeFilter: TimelineEventType | '';
  onEventTypeChange: (value: TimelineEventType | '') => void;
}

/**
 * Filter toolbar for the timeline panel.
 * Provides search input, severity dropdown, and event type dropdown.
 */
export function TimelineFilter({
  search,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  eventTypeFilter,
  onEventTypeChange,
}: TimelineFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-gray-100"
        />
      </div>

      {/* Severity filter */}
      <select
        value={severityFilter}
        onChange={(e) => onSeverityChange(e.target.value as TimelineSeverity | '')}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-gray-100"
      >
        <option value="">All Severities</option>
        {TIMELINE_SEVERITIES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* Event type filter */}
      <select
        value={eventTypeFilter}
        onChange={(e) => onEventTypeChange(e.target.value as TimelineEventType | '')}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-gray-100 max-w-[220px]"
      >
        <option value="">All Event Types</option>
        {TIMELINE_EVENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t.replace(':', ' — ')}
          </option>
        ))}
      </select>
    </div>
  );
}
