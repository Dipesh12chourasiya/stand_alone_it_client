import { dashboardClient } from './dashboard.client';
import type { DashboardStats, WeeklyData, MonthlyData, StatusCounts } from '../types/dashboard.types';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dashboardApi = {
  stats: () => dashboardClient.get<ApiEnvelope<DashboardStats>>('/stats'),
  weekly: () => dashboardClient.get<ApiEnvelope<WeeklyData>>('/weekly'),
  monthly: () => dashboardClient.get<ApiEnvelope<MonthlyData>>('/monthly'),
  recent: (limit = 5) =>
    dashboardClient.get<ApiEnvelope<{ interviews: unknown[] }>>('/recent', {
      params: { limit },
    }),
  statusCounts: () =>
    dashboardClient.get<ApiEnvelope<StatusCounts>>('/status-counts'),
};
