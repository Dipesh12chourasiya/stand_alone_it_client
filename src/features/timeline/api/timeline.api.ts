import { timelineClient } from './timeline.client';
import type {
  TimelineListData,
  TimelineDetailData,
  TimelineExportData,
  TimelineListParams,
} from '../types/timeline.types';

interface TimelineApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const timelineApi = {
  list: async (sessionId: string, params: TimelineListParams): Promise<TimelineApiEnvelope<TimelineListData>> => {
    const { data } = await timelineClient.get<TimelineApiEnvelope<TimelineListData>>(`/${sessionId}`, { params });
    return data;
  },

  create: async (input: { sessionId: string; eventType: string; severity: string; message: string; metadata?: Record<string, unknown> }): Promise<TimelineApiEnvelope<TimelineDetailData>> => {
    const { data } = await timelineClient.post<TimelineApiEnvelope<TimelineDetailData>>('/', input);
    return data;
  },

  exportEvents: async (sessionId: string): Promise<TimelineApiEnvelope<TimelineExportData>> => {
    const { data } = await timelineClient.get<TimelineApiEnvelope<TimelineExportData>>(`/${sessionId}/export`);
    return data;
  },
};
