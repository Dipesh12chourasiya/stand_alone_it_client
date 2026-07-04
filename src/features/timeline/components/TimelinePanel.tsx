import { useState, useEffect, useRef, useCallback } from 'react';
import { useTimelineEvents, useTimelineSocket, timelineKeys } from '../hooks/useTimeline';
import { TimelineItem } from './TimelineItem';
import { TimelineFilter } from './TimelineFilter';
import { TimelineEmptyState } from './TimelineEmptyState';
import { TimelineLoading } from './TimelineLoading';
import type { TimelineEventType, TimelineSeverity, TimelineSocketEvent } from '../types/timeline.types';
import { useQueryClient } from '@tanstack/react-query';

interface TimelinePanelProps {
  sessionId: string;
  /** Optional pre-connected socket instance for real-time updates */
  socket?: {
    on: (event: string, callback: (data: TimelineSocketEvent) => void) => void;
    off: (event: string, callback: (data: TimelineSocketEvent) => void) => void;
  } | null;
}

/**
 * Full-featured timeline panel for an interview session.
 *
 * Supports search, severity filter, event type filter, auto-scroll,
 * expandable metadata, and real-time Socket.IO updates.
 */
export function TimelinePanel({ sessionId, socket }: TimelinePanelProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<TimelineSeverity | ''>('');
  const [eventTypeFilter, setEventTypeFilter] = useState<TimelineEventType | ''>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { appendSocketEvent } = useTimelineSocket(sessionId);

  // Build query params from filter state
  const params = {
    page: 1,
    limit: 100,
    search: search || undefined,
    severity: severityFilter || undefined,
    eventType: eventTypeFilter || undefined,
    sort: 'newest' as const,
  };

  const { data, isLoading, isError, error } = useTimelineEvents(sessionId, params);
  const events = data?.events || [];

  // ─── Auto-scroll to top when new events arrive ──────────────

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length, autoScroll]);

  // ─── Socket.IO real-time listener ──────────────────────────

  const handleTimelineEvent = useCallback(
    (socketEvent: TimelineSocketEvent) => {
      appendSocketEvent(socketEvent);
    },
    [appendSocketEvent],
  );

  useEffect(() => {
    if (!socket) return;

    // Subscribe to timeline events from the existing socket connection
    socket.on('timeline:event', handleTimelineEvent);

    return () => {
      socket.off('timeline:event', handleTimelineEvent);
    };
  }, [socket, handleTimelineEvent]);

  // ─── Refresh on mount if no socket provided ────────────────

  const hasFilters = !!search || !!severityFilter || !!eventTypeFilter;

  const clearFilters = useCallback(() => {
    setSearch('');
    setSeverityFilter('');
    setEventTypeFilter('');
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Timeline
          {data?.pagination && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({data.pagination.total} events)
            </span>
          )}
        </h3>
        <label className="flex items-center gap-1.5 text-xs text-gray-400">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Auto-scroll
        </label>
      </div>

      {/* Filters */}
      <div className="px-4 pt-3">
        <TimelineFilter
          search={search}
          onSearchChange={setSearch}
          severityFilter={severityFilter}
          onSeverityChange={setSeverityFilter}
          eventTypeFilter={eventTypeFilter}
          onEventTypeChange={setEventTypeFilter}
        />
      </div>

      {/* Events list */}
      <div ref={scrollRef} className="max-h-[600px] overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <TimelineLoading />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-3xl mb-3">⚠️</span>
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
              Failed to load timeline
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {(error as { message?: string })?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: timelineKeys.list(sessionId, params) });
              }}
              className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Try again
            </button>
          </div>
        ) : events.length === 0 ? (
          <TimelineEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        ) : (
          events.map((event, idx) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={idx === events.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
