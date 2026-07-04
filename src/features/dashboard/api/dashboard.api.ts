import { dashboardClient } from './dashboard.client';
import type { DashboardStats, WeeklyData, MonthlyData, StatusCounts, RecentInterview } from '../types/dashboard.types';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dashboardApi = {
  stats: async (): Promise<ApiEnvelope<DashboardStats>> => {
    const { data } = await dashboardClient.get<ApiEnvelope<DashboardStats>>('/stats');
    return data;
  },

  weekly: async (): Promise<ApiEnvelope<WeeklyData>> => {
    const { data } = await dashboardClient.get<ApiEnvelope<WeeklyData>>('/weekly');
    return data;
  },

  monthly: async (): Promise<ApiEnvelope<MonthlyData>> => {
    const { data } = await dashboardClient.get<ApiEnvelope<MonthlyData>>('/monthly');
    return data;
  },

  recent: async (limit = 5): Promise<ApiEnvelope<{ interviews: RecentInterview[] }>> => {
    const { data } = await dashboardClient.get<ApiEnvelope<{ interviews: RecentInterview[] }>>('/recent', {
      params: { limit },
    });
    return data;
  },

  statusCounts: async (): Promise<ApiEnvelope<StatusCounts>> => {
    const { data } = await dashboardClient.get<ApiEnvelope<StatusCounts>>('/status-counts');
    return data;
  },
};
