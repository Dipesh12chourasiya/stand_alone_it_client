import { timelineClient } from './timeline.client';
import type {
  TimelineEvent,
  TimelineListData,
  TimelineDetailData,
  TimelineExportData,
  TimelineListParams,
} from '../types/timeline.types';

export const timelineApi = {
  list: (sessionId: string, params: TimelineListParams) =>
    timelineClient.get<TimelineListData>(`/${sessionId}`, { params }),

  create: (data: { sessionId: string; eventType: string; severity: string; message: string; metadata?: Record<string, unknown> }) =>
    timelineClient.post<TimelineDetailData>('/', data),

  exportEvents: (sessionId: string) =>
    timelineClient.get<TimelineExportData>(`/${sessionId}/export`),
};
