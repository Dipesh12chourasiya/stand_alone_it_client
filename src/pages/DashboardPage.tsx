import { useAuthStore } from '@/features/auth/store/auth.store';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Company" value={user?.company ?? '—'} />
        <StatCard label="Role" value={user?.role ?? '—'} />
        <StatCard label="Member since" value={formatDate(user?.createdAt)} />
      </div>

      {/* Placeholder sections for future features */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">
          Getting started
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Your dashboard will populate with interview insights and monitoring
          data once you start using IntegrityCam.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-sm font-semibold text-neutral-600">
              1
            </div>
            <h3 className="mt-3 text-sm font-medium text-neutral-900">
              Create an interview
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Set up your first proctored interview session.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-sm font-semibold text-neutral-600">
              2
            </div>
            <h3 className="mt-3 text-sm font-medium text-neutral-900">
              Invite candidates
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Send invitations to your candidates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return '—';
  }
}
