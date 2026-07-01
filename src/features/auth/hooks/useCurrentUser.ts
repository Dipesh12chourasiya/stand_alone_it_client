import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.data.recruiter;
    },
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}
