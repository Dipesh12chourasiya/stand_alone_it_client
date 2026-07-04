import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { timelineApi } from '../api/timeline.api';
import type {
  TimelineEvent,
  TimelineListParams,
  TimelineSocketEvent,
} from '../types/timeline.types';

// ─── Query Keys ─────────────────────────────────────────────────

export const timelineKeys = {
  all: ['timeline'] as const,
  list: (sessionId: string, params: TimelineListParams) =>
    ['timeline', sessionId, 'list', params] as const,
  export: (sessionId: string) => ['timeline', sessionId, 'export'] as const,
};

// ─── List events for a session ──────────────────────────────────

export function useTimelineEvents(
  sessionId: string | undefined,
  params: TimelineListParams = {},
) {
  return useQuery({
    queryKey: timelineKeys.list(sessionId!, params),
    queryFn: async () => {
      const response = await timelineApi.list(sessionId!, params);
      return response.data;
    },
    enabled: !!sessionId,
    placeholderData: keepPreviousData,
  });
}

// ─── Create event ───────────────────────────────────────────────

export function useCreateTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      sessionId: string;
      eventType: string;
      severity: string;
      message: string;
      metadata?: Record<string, unknown>;
    }) => timelineApi.create(data),

    onSuccess: (_, variables) => {
      // Invalidate the list query so it refetches
      queryClient.invalidateQueries({
        queryKey: ['timeline', variables.sessionId],
      });
    },
  });
}

// ─── Hook to merge socket events into TanStack Query cache ──────
// Call this from components that need real-time timeline updates.

export function useTimelineSocket(sessionId: string | undefined) {
  const queryClient = useQueryClient();
  // Track latest params used so we can append to the current cache
  const paramsRef = useRef<TimelineListParams>({});

  const appendSocketEvent = useCallback(
    (socketEvent: TimelineSocketEvent) => {
      if (!sessionId) return;

      // Build a synthetic event object and prepend it to the cache
      const syntheticEvent: TimelineEvent = {
        id: `socket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sessionId,
        eventType: socketEvent.eventType,
        severity: socketEvent.severity,
        message: socketEvent.message,
        metadata: socketEvent.metadata,
        createdAt: socketEvent.createdAt || new Date().toISOString(),
      };

      // Update the list cache by prepending the new event
      queryClient.setQueryData(
        timelineKeys.list(sessionId, paramsRef.current),
        (old: { events: TimelineEvent[]; pagination: { total: number } } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            events: [syntheticEvent, ...old.events].slice(0, 200),
            pagination: { ...old.pagination, total: old.pagination.total + 1 },
          };
        },
      );
    },
    [sessionId, queryClient],
  );

  return { appendSocketEvent, paramsRef };
}
