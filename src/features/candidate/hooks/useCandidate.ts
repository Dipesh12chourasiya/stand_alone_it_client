import { useQuery, useMutation } from '@tanstack/react-query';
import { candidateApi } from '../api/candidate.api';
import type { DeviceVerificationInput } from '../types/candidate.types';

export const candidateKeys = {
  validate: (token: string) => ['candidate', 'validate', token] as const,
  join: (token: string) => ['candidate', 'join', token] as const,
  waitingRoom: (token: string) => ['candidate', 'waiting-room', token] as const,
  deviceVerification: (token: string) =>
    ['candidate', 'device-verification', token] as const,
};

export function useValidateToken(token: string) {
  return useQuery({
    queryKey: candidateKeys.validate(token),
    queryFn: async () => {
      const res = await candidateApi.validate(token);
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useJoinInterview(token: string) {
  return useQuery({
    queryKey: candidateKeys.join(token),
    queryFn: async () => {
      const res = await candidateApi.join(token);
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useWaitingRoom(token: string) {
  return useQuery({
    queryKey: candidateKeys.waitingRoom(token),
    queryFn: async () => {
      const res = await candidateApi.waitingRoom(token);
      return res.data;
    },
    enabled: !!token,
    refetchInterval: 5_000,
  });
}

export function useSubmitDeviceVerification(token: string) {
  return useMutation({
    mutationFn: (data: DeviceVerificationInput) =>
      candidateApi.submitDeviceVerification(token, data),
  });
}

export function useDeviceVerificationStatus(token: string) {
  return useQuery({
    queryKey: candidateKeys.deviceVerification(token),
    queryFn: async () => {
      const res = await candidateApi.getDeviceVerification(token);
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });
}
