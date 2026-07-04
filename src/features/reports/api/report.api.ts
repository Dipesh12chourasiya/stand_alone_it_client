import { reportClient } from './report.client';
import type {
  ApiEnvelope,
  ReportListData,
  ReportDetailData,
  ReportListParams,
  CreateReportInput,
} from '../types/report.types';

export const reportApi = {
  list: async (params: ReportListParams): Promise<ApiEnvelope<ReportListData>> => {
    const { data } = await reportClient.get<ApiEnvelope<ReportListData>>('/', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiEnvelope<ReportDetailData>> => {
    const { data } = await reportClient.get<ApiEnvelope<ReportDetailData>>(`/${id}`);
    return data;
  },

  create: async (input: CreateReportInput): Promise<ApiEnvelope<ReportDetailData>> => {
    const { data } = await reportClient.post<ApiEnvelope<ReportDetailData>>('/', input);
    return data;
  },

  delete: async (id: string): Promise<ApiEnvelope<null>> => {
    const { data } = await reportClient.delete<ApiEnvelope<null>>(`/${id}`);
    return data;
  },

  getDownloadUrl: (id: string): string => `/api/v1/reports/${id}/download`,
};
