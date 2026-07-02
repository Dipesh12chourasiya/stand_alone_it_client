import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { WeeklyData } from '../types/dashboard.types';

interface WeeklyChartProps {
  data: WeeklyData | undefined;
  isLoading: boolean;
  isError: boolean;
}

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function WeeklyChart({ data, isLoading, isError }: WeeklyChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError || !data) {
    return <ChartError message="Could not load weekly data." />;
  }

  const chartData = DAYS.map((day) => ({
    day: day.slice(0, 3),
    interviews: data[day as keyof WeeklyData] ?? 0,
  }));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">
        Weekly Interviews
      </h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: '#737373' }}
              axisLine={{ stroke: '#e5e5e5' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#737373' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#f5f5f5' }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                fontSize: '13px',
              }}
            />
            <Bar
              dataKey="interviews"
              fill="#0a0a0a"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
      <div className="mt-4 h-64 animate-pulse rounded-lg bg-neutral-50" />
    </div>
  );
}

function ChartError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm font-medium text-red-600">Failed to load</p>
        <p className="mt-1 text-xs text-neutral-500">{message}</p>
      </div>
    </div>
  );
}
