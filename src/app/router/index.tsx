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

// Reports pages (protected)
import { ReportsListPage } from '@/features/reports/pages/ReportsListPage';
import { ReportDetailsPage } from '@/features/reports/pages/ReportDetailsPage';

// Candidate portal pages (public)
import { CandidateJoinPage } from '@/features/candidate/pages/CandidateJoinPage';
import { DeviceVerificationPage } from '@/features/candidate/pages/DeviceVerificationPage';
import { CandidateWaitingPage } from '@/features/candidate/pages/CandidateWaitingPage';

// Interview session pages
import { InterviewSessionPage } from '@/features/interview-session/pages/InterviewSessionPage';
import { PhoneJoinPage } from '@/features/interview-session/pages/PhoneJoinPage';
import { PhoneSessionPage } from '@/features/interview-session/pages/PhoneSessionPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Candidate portal (public — accessed via invitation link) */}
      <Route path="/candidate/join/:token" element={<CandidateJoinPage />} />
      <Route
        path="/candidate/verify/:token"
        element={<DeviceVerificationPage />}
      />
      <Route
        path="/candidate/waiting/:token"
        element={<CandidateWaitingPage />}
      />

      {/* Phone connection (public — accessed via QR code) */}
      <Route path="/phone/join/:sessionToken" element={<PhoneJoinPage />} />
      <Route path="/phone/session/:sessionToken" element={<PhoneSessionPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Interview management */}
          <Route path="/interviews" element={<InterviewListPage />} />
          <Route path="/interviews/new" element={<CreateInterviewPage />} />
          <Route path="/interviews/:id" element={<InterviewDetailsPage />} />
          <Route path="/interviews/:id/edit" element={<EditInterviewPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsListPage />} />
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
        </Route>

        {/* Interview session (full screen, no dashboard layout) */}
        <Route path="/session/:id" element={<InterviewSessionPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
