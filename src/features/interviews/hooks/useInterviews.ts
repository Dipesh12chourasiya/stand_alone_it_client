import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { interviewApi } from '../api/interview.api';
import type {
  InterviewListParams,
  CreateInterviewInput,
  UpdateInterviewInput,
  ApiError,
} from '../types/interview.types';

// ─── Query Keys ──────────────────────────────────────────────

export const interviewKeys = {
  all: ['interviews'] as const,
  list: (params: InterviewListParams) =>
    ['interviews', 'list', params] as const,
  detail: (id: string) => ['interviews', 'detail', id] as const,
};

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Remove undefined values from params so they aren't sent to the API.
 */
function cleanParams(
  params: InterviewListParams,
): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

// ─── List ────────────────────────────────────────────────────

export function useInterviewList(params: InterviewListParams) {
  return useQuery({
    queryKey: interviewKeys.list(params),
    queryFn: async () => {
      const response = await interviewApi.list(cleanParams(params));
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

// ─── Detail ──────────────────────────────────────────────────

export function useInterview(id: string | undefined) {
  return useQuery({
    queryKey: interviewKeys.detail(id!),
    queryFn: async () => {
      const response = await interviewApi.getById(id!);
      return response.data.interview;
    },
    enabled: !!id,
  });
}

// ─── Create ──────────────────────────────────────────────────

export function useCreateInterview() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateInterviewInput) => interviewApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
      toast.success('Interview created successfully.');
      navigate('/interviews');
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || 'Failed to create interview.');
    },
  });
}

// ─── Update ──────────────────────────────────────────────────

export function useUpdateInterview(id: string | undefined) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: UpdateInterviewInput) => interviewApi.update(id!, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(id!) });
      toast.success('Interview updated successfully.');
      navigate('/interviews');
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || 'Failed to update interview.');
    },
  });
}

// ─── Delete ──────────────────────────────────────────────────

export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => interviewApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
      toast.success('Interview deleted successfully.');
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || 'Failed to delete interview.');
    },
  });
}

// ─── Generate Invite ─────────────────────────────────────────

export function useGenerateInvite() {
  return useMutation({
    mutationFn: (id: string) => interviewApi.generateInvite(id),

    onSuccess: () => {
      toast.success('Invitation link generated.');
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || 'Failed to generate invitation.');
    },
  });
}

// ─── Join Interview (Recruiter) ─────────────────────────────────

export function useJoinInterview() {
  return useMutation({
    mutationFn: (id: string) => interviewApi.joinInterview(id),

    onError: (error: ApiError) => {
      toast.error(error?.message || 'Failed to join interview.');
    },
  });
}
