import { sessionClient } from './session.client';
import type { ApiEnvelope, PhoneSession, SessionWithInterview } from '../types/session.types';

export const sessionApi = {
  // Recruiter: create a phone session for an interview
  createSession: async (interviewId: string): Promise<ApiEnvelope<{ session: PhoneSession }>> => {
    const { data } = await sessionClient.post<ApiEnvelope<{ session: PhoneSession }>>(`/session/${interviewId}`);
    return data;
  },

  // Recruiter: get active session for an interview
  getActiveSession: async (interviewId: string): Promise<ApiEnvelope<{ session: PhoneSession | null }>> => {
    const { data } = await sessionClient.get<ApiEnvelope<{ session: PhoneSession | null }>>(`/active/${interviewId}`);
    return data;
  },

  // Phone: validate session token
  validateSession: async (sessionToken: string): Promise<ApiEnvelope<{ session: PhoneSession }>> => {
    const { data } = await sessionClient.get<ApiEnvelope<{ session: PhoneSession }>>(`/validate/${sessionToken}`);
    return data;
  },

  // Phone: get full session with interview details
  getSession: async (sessionToken: string): Promise<ApiEnvelope<{ session: SessionWithInterview }>> => {
    const { data } = await sessionClient.get<ApiEnvelope<{ session: SessionWithInterview }>>(`/session/${sessionToken}`);
    return data;
  },

  // Phone: mark as connected
  connectPhone: async (sessionToken: string, deviceInfo?: Record<string, unknown>): Promise<ApiEnvelope<{ session: PhoneSession }>> => {
    const { data } = await sessionClient.post<ApiEnvelope<{ session: PhoneSession }>>(`/connect/${sessionToken}`, {
      deviceInfo,
    });
    return data;
  },

  // Phone: update device info
  updateDeviceInfo: async (sessionToken: string, deviceInfo: Record<string, unknown>): Promise<ApiEnvelope<{ session: PhoneSession }>> => {
    const { data } = await sessionClient.patch<ApiEnvelope<{ session: PhoneSession }>>(`/device-info/${sessionToken}`, {
      deviceInfo,
    });
    return data;
  },
};
