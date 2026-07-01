import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';

/**
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to /login.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  // If there's no token at all, we know immediately — no need to wait
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token exists but auth might still be initializing via the AuthProvider
  if (!isAuthenticated) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  return <Outlet />;
}

/**
 * Wraps auth pages (login/register).
 * Redirects already-authenticated users to /dashboard.
 */
export function RedirectIfAuthenticated() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
