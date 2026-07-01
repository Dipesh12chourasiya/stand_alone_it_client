import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RedirectIfAuthenticated } from '@/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { InterviewListPage } from '@/features/interviews/pages/InterviewListPage';
import { CreateInterviewPage } from '@/features/interviews/pages/CreateInterviewPage';
import { EditInterviewPage } from '@/features/interviews/pages/EditInterviewPage';
import { InterviewDetailsPage } from '@/features/interviews/pages/InterviewDetailsPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Interview management */}
          <Route path="/interviews" element={<InterviewListPage />} />
          <Route path="/interviews/new" element={<CreateInterviewPage />} />
          <Route path="/interviews/:id" element={<InterviewDetailsPage />} />
          <Route path="/interviews/:id/edit" element={<EditInterviewPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
