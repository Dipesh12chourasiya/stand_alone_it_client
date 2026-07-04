import { useState } from 'react';
import type { TimelineEvent } from '../types/timeline.types';
import { EVENT_ICONS, EVENT_LABELS, SEVERITY_BORDER } from '../types/timeline.types';
import { SeverityBadge } from './SeverityBadge';

interface TimelineItemProps {
  event: TimelineEvent;
  isLast?: boolean;
}

/**
 * A single timeline entry with icon, title, timestamp, severity, and optional expandable metadata.
 */
export function TimelineItem({ event, isLast = false }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMetadata = event.metadata && Object.keys(event.metadata).length > 0;

  const icon = EVENT_ICONS[event.eventType] || '📌';
  const label = EVENT_LABELS[event.eventType] || event.eventType;
  const time = new Date(event.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const date = new Date(event.createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`relative pl-10 pb-4 ${isLast ? '' : ''}`}>
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-[17px] top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      )}

      {/* Event dot with icon */}
      <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-base border border-gray-200 dark:border-gray-700">
        {icon}
      </div>

      {/* Event content */}
      <div
        className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-3 ${SEVERITY_BORDER[event.severity]} border-l-4`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {label}
              </h4>
              <SeverityBadge severity={event.severity} />
            </div>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {event.message}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <time className="block text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {time}
            </time>
            <span className="block text-xs text-gray-400 dark:text-gray-500">
              {date}
            </span>
          </div>
        </div>

        {/* Expand metadata */}
        {hasMetadata && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {expanded ? 'Hide details' : 'Show details'}
            </button>
            {expanded && (
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 dark:bg-gray-900 p-2 text-xs text-gray-600 dark:text-gray-400">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
