import { interviewClient } from './interview.client';
import type {
  ApiResponse,
  InterviewListData,
  InterviewDetailData,
  InterviewListParams,
} from '../types/interview.types';
import type { CreateInterviewInput, UpdateInterviewInput } from '../types/interview.types';

export const interviewApi = {
  list: async (params: InterviewListParams): Promise<ApiResponse<InterviewListData>> => {
    const { data } = await interviewClient.get<ApiResponse<InterviewListData>>('/', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<InterviewDetailData>> => {
    const { data } = await interviewClient.get<ApiResponse<InterviewDetailData>>(`/${id}`);
    return data;
  },

  create: async (input: CreateInterviewInput): Promise<ApiResponse<InterviewDetailData>> => {
    const { data } = await interviewClient.post<ApiResponse<InterviewDetailData>>('/', input);
    return data;
  },

  update: async (id: string, input: UpdateInterviewInput): Promise<ApiResponse<InterviewDetailData>> => {
    const { data } = await interviewClient.patch<ApiResponse<InterviewDetailData>>(`/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await interviewClient.delete<ApiResponse<null>>(`/${id}`);
    return data;
  },

  generateInvite: async (id: string): Promise<ApiResponse<{ inviteToken: string; inviteTokenExpiresAt: string }>> => {
    const { data } = await interviewClient.post<
      ApiResponse<{ inviteToken: string; inviteTokenExpiresAt: string }>
    >(`/${id}/generate-invite`);
    return data;
  },

  joinInterview: async (id: string): Promise<ApiResponse<{
    id: string;
    title: string;
    candidateName: string;
    waitingRoomStatus: string;
  }>> => {
    const { data } = await interviewClient.post<
      ApiResponse<{
        id: string;
        title: string;
        candidateName: string;
        waitingRoomStatus: string;
      }>
    >(`/${id}/join`);
    return data;
  },
};
