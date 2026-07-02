import { candidateClient } from './candidate.client';
import type { DeviceVerificationInput } from '../types/candidate.types';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const candidateApi = {
  validate: (token: string) =>
    candidateClient.get<ApiEnvelope<unknown>>(`/validate/${token}`),

  join: (token: string) =>
    candidateClient.get<ApiEnvelope<unknown>>(`/join/${token}`),

  waitingRoom: (token: string) =>
    candidateClient.get<ApiEnvelope<unknown>>(`/waiting-room/${token}`),

  submitDeviceVerification: (token: string, data: DeviceVerificationInput) =>
    candidateClient.post<ApiEnvelope<unknown>>(
      `/device-verification/${token}`,
      data,
    ),

  getDeviceVerification: (token: string) =>
    candidateClient.get<ApiEnvelope<unknown>>(`/device-verification/${token}`),
};
