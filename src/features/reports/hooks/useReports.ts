import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../api/report.api';
import type {
  ReportListParams,
  CreateReportInput,
} from '../types/report.types';

// ─── Query Keys ─────────────────────────────────────────────────

export const reportKeys = {
  all: ['reports'] as const,
  list: (params: ReportListParams) => ['reports', 'list', params] as const,
  detail: (id: string) => ['reports', 'detail', id] as const,
};

// ─── Helpers ────────────────────────────────────────────────────

function cleanParams(params: ReportListParams): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// ─── List Reports ───────────────────────────────────────────────

export function useReportList(params: ReportListParams) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: async () => {
      const response = await reportApi.list(cleanParams(params));
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

// ─── Report Detail ──────────────────────────────────────────────

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: reportKeys.detail(id!),
    queryFn: async () => {
      const response = await reportApi.getById(id!);
      return response.data.report;
    },
    enabled: !!id,
  });
}

// ─── Generate Report ────────────────────────────────────────────

export function useGenerateReport() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateReportInput) => reportApi.create(data),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      toast.success('Report generated successfully.');
      navigate(`/reports/${response.data.report.id}`);
    },

    onError: (error: { message?: string }) => {
      toast.error(error?.message || 'Failed to generate report.');
    },
  });
}

// ─── Delete Report ──────────────────────────────────────────────

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      toast.success('Report deleted successfully.');
    },

    onError: (error: { message?: string }) => {
      toast.error(error?.message || 'Failed to delete report.');
    },
  });
}
