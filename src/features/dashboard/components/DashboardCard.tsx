import type { ReactNode } from 'react';

interface DashboardCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  description: string;
  trend?: { direction: 'up' | 'down'; label: string };
}

export function DashboardCard({
  label,
  value,
  icon,
  description,
  trend,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
          {icon}
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.direction === 'up'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <svg
              className={`h-3 w-3 ${trend.direction === 'up' ? '' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
            {trend.label}
          </span>
        )}
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
        {value.toLocaleString()}
      </p>
      <p className="text-sm font-medium text-neutral-700">{label}</p>
      <p className="mt-0.5 text-xs text-neutral-400">{description}</p>
    </div>
  );
}
