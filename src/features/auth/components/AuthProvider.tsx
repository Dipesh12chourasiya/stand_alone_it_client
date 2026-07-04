import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useCurrentUser } from '../hooks/useCurrentUser';

/**
 * Handles auth initialization on app mount:
 *  - If a persisted token exists, validates it against /me
 *  - Populates the store on success, clears on failure
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const { data, isError, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!token) {
      return; // No session to validate — stay as-is
    }

    if (isLoading) {
      return; // Still fetching
    }

    if (data) {
      setUser(data);
    } else if (isError) {
      logout();
    }
  }, [token, data, isError, isLoading, setUser, logout]);

  return <>{children}</>;
}
