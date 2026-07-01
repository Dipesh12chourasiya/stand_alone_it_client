import { interviewClient } from './interview.client';
import type {
  ApiResponse,
  InterviewListData,
  InterviewDetailData,
  InterviewListParams,
} from '../types/interview.types';
import type { CreateInterviewInput, UpdateInterviewInput } from '../types/interview.types';

export const interviewApi = {
  list: (params: InterviewListParams) =>
    interviewClient.get<ApiResponse<InterviewListData>>('/', { params }),

  getById: (id: string) =>
    interviewClient.get<ApiResponse<InterviewDetailData>>(`/${id}`),

  create: (data: CreateInterviewInput) =>
    interviewClient.post<ApiResponse<InterviewDetailData>>('/', data),

  update: (id: string, data: UpdateInterviewInput) =>
    interviewClient.patch<ApiResponse<InterviewDetailData>>(`/${id}`, data),

  delete: (id: string) =>
    interviewClient.delete<ApiResponse<null>>(`/${id}`),
};
