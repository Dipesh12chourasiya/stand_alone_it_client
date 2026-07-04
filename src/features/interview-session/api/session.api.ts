import { sessionClient } from './session.client';
import type { ApiEnvelope, PhoneSession, SessionWithInterview } from '../types/session.types';

export const sessionApi = {
  // Recruiter: create a phone session for an interview
  createSession: (interviewId: string) =>
    sessionClient.post<ApiEnvelope<{ session: PhoneSession }>>(`/session/${interviewId}`),

  // Recruiter: get active session for an interview
  getActiveSession: (interviewId: string) =>
    sessionClient.get<ApiEnvelope<{ session: PhoneSession | null }>>(`/active/${interviewId}`),

  // Phone: validate session token
  validateSession: (sessionToken: string) =>
    sessionClient.get<ApiEnvelope<{ session: PhoneSession }>>(`/validate/${sessionToken}`),

  // Phone: get full session with interview details
  getSession: (sessionToken: string) =>
    sessionClient.get<ApiEnvelope<{ session: SessionWithInterview }>>(`/session/${sessionToken}`),

  // Phone: mark as connected
  connectPhone: (sessionToken: string, deviceInfo?: Record<string, unknown>) =>
    sessionClient.post<ApiEnvelope<{ session: PhoneSession }>>(`/connect/${sessionToken}`, {
      deviceInfo,
    }),

  // Phone: update device info
  updateDeviceInfo: (sessionToken: string, deviceInfo: Record<string, unknown>) =>
    sessionClient.patch<ApiEnvelope<{ session: PhoneSession }>>(`/device-info/${sessionToken}`, {
      deviceInfo,
    }),
};
