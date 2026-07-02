import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => ['dashboard', 'stats'] as const,
  weekly: () => ['dashboard', 'weekly'] as const,
  monthly: () => ['dashboard', 'monthly'] as const,
  recent: () => ['dashboard', 'recent'] as const,
  statusCounts: () => ['dashboard', 'status-counts'] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const res = await dashboardApi.stats();
      return res.data;
    },
  });
}

export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: dashboardKeys.weekly(),
    queryFn: async () => {
      const res = await dashboardApi.weekly();
      return res.data;
    },
  });
}

export function useMonthlyAnalytics() {
  return useQuery({
    queryKey: dashboardKeys.monthly(),
    queryFn: async () => {
      const res = await dashboardApi.monthly();
      return res.data;
    },
  });
}

export function useRecentInterviews(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.recent(),
    queryFn: async () => {
      const res = await dashboardApi.recent(limit);
      return res.data.interviews;
    },
  });
}

export function useStatusCounts() {
  return useQuery({
    queryKey: dashboardKeys.statusCounts(),
    queryFn: async () => {
      const res = await dashboardApi.statusCounts();
      return res.data;
    },
  });
}
