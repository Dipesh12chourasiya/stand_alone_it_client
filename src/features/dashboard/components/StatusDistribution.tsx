import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { StatusCounts } from '../types/dashboard.types';

interface StatusDistributionProps {
  data: StatusCounts | undefined;
  isLoading: boolean;
  isError: boolean;
}

const COLORS: Record<string, string> = {
  Pending: '#a3a3a3',
  Scheduled: '#2563eb',
  InProgress: '#d97706',
  Completed: '#16a34a',
  Cancelled: '#dc2626',
};

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pending',
  Scheduled: 'Scheduled',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

export function StatusDistribution({
  data,
  isLoading,
  isError,
}: StatusDistributionProps) {
  if (isLoading) {
    return <Skeleton />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-sm font-medium text-red-600">Failed to load</p>
          <p className="mt-1 text-xs text-neutral-500">
            Could not load status distribution.
          </p>
        </div>
      </div>
    );
  }

  const chartData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] ?? status,
      value: count,
      color: COLORS[status] ?? '#a3a3a3',
    }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">
          Interview Status
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-sm text-neutral-400">No interviews yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">
        Interview Status
      </h3>
      <div className="mt-2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                fontSize: '13px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-neutral-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
      <div className="mt-4 h-64 animate-pulse rounded-full bg-neutral-50 mx-auto w-48" />
    </div>
  );
}
