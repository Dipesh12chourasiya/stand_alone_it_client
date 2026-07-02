import { useAuthStore } from '@/features/auth/store/auth.store';
import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import { WeeklyChart } from '@/features/dashboard/components/WeeklyChart';
import { MonthlyChart } from '@/features/dashboard/components/MonthlyChart';
import { StatusDistribution } from '@/features/dashboard/components/StatusDistribution';
import { RecentInterviewsTable } from '@/features/dashboard/components/RecentInterviewsTable';
import {
  useDashboardStats,
  useWeeklyAnalytics,
  useMonthlyAnalytics,
  useRecentInterviews,
  useStatusCounts,
} from '@/features/dashboard/hooks/useDashboard';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: weekly, isLoading: weeklyLoading, isError: weeklyError } =
    useWeeklyAnalytics();
  const { data: monthly, isLoading: monthlyLoading, isError: monthlyError } =
    useMonthlyAnalytics();
  const {
    data: recent,
    isLoading: recentLoading,
    isError: recentError,
  } = useRecentInterviews();
  const {
    data: statusCounts,
    isLoading: statusLoading,
    isError: statusError,
  } = useStatusCounts();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s an overview of your interviews.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DashboardCard
          label="Total Interviews"
          value={stats?.totalInterviews ?? 0}
          description="All interviews created"
          icon={<CalendarIcon />}
        />
        <DashboardCard
          label="Upcoming"
          value={stats?.upcomingInterviews ?? 0}
          description="Scheduled interviews"
          icon={<UpcomingIcon />}
        />
        <DashboardCard
          label="Completed"
          value={stats?.completedInterviews ?? 0}
          description="Successfully finished"
          icon={<CompletedIcon />}
        />
        <DashboardCard
          label="Cancelled"
          value={stats?.cancelledInterviews ?? 0}
          description="Cancelled interviews"
          icon={<CancelledIcon />}
        />
        <DashboardCard
          label="Today"
          value={stats?.todaysInterviews ?? 0}
          description="Interviews scheduled today"
          icon={<TodayIcon />}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyChart
          data={weekly}
          isLoading={weeklyLoading}
          isError={weeklyError}
        />
        <MonthlyChart
          data={monthly}
          isLoading={monthlyLoading}
          isError={monthlyError}
        />
      </div>

      {/* Status distribution + Recent interviews */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <StatusDistribution
            data={statusCounts}
            isLoading={statusLoading}
            isError={statusError}
          />
        </div>
        <div className="lg:col-span-2">
          <RecentInterviewsTable
            interviews={recent}
            isLoading={recentLoading}
            isError={recentError}
          />
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function UpcomingIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CompletedIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CancelledIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TodayIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}
