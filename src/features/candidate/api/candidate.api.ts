import { candidateClient } from './candidate.client';
import type {
  DeviceVerificationInput,
  DeviceVerificationResult,
  ValidateResponse,
  JoinInterviewData,
  WaitingRoomData,
} from '../types/candidate.types';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const candidateApi = {
  validate: async (token: string): Promise<ApiEnvelope<ValidateResponse>> => {
    const { data } = await candidateClient.get<ApiEnvelope<ValidateResponse>>(`/validate/${token}`);
    return data;
  },

  join: async (token: string): Promise<ApiEnvelope<JoinInterviewData>> => {
    const { data } = await candidateClient.get<ApiEnvelope<JoinInterviewData>>(`/join/${token}`);
    return data;
  },

  waitingRoom: async (token: string): Promise<ApiEnvelope<WaitingRoomData>> => {
    const { data } = await candidateClient.get<ApiEnvelope<WaitingRoomData>>(`/waiting-room/${token}`);
    return data;
  },

  submitDeviceVerification: async (token: string, input: DeviceVerificationInput): Promise<ApiEnvelope<DeviceVerificationResult>> => {
    const { data } = await candidateClient.post<ApiEnvelope<DeviceVerificationResult>>(
      `/device-verification/${token}`,
      input,
    );
    return data;
  },

  getDeviceVerification: async (token: string): Promise<ApiEnvelope<DeviceVerificationResult>> => {
    const { data } = await candidateClient.get<ApiEnvelope<DeviceVerificationResult>>(`/device-verification/${token}`);
    return data;
  },
};
