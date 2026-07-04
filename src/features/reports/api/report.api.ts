import { reportClient } from './report.client';
import type {
  ReportListData,
  ReportDetailData,
  ReportListParams,
  CreateReportInput,
} from '../types/report.types';

export const reportApi = {
  list: (params: ReportListParams) =>
    reportClient.get<ReportListData>('/', { params }),

  getById: (id: string) =>
    reportClient.get<ReportDetailData>(`/${id}`),

  create: (data: CreateReportInput) =>
    reportClient.post<ReportDetailData>('/', data),

  delete: (id: string) =>
    reportClient.delete<{ success: boolean; message: string; data: null }>(`/${id}`),

  getDownloadUrl: (id: string) => `/api/v1/reports/${id}/download`,
};
