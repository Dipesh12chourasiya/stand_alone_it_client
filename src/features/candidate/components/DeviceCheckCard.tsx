import type { ReactNode } from 'react';

interface DeviceCheckCardProps {
  label: string;
  passed: boolean | null;
  icon: ReactNode;
  description: string;
}

export function DeviceCheckCard({
  label,
  passed,
  icon,
  description,
}: DeviceCheckCardProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
        passed === true
          ? 'border-green-200 bg-green-50'
          : passed === false
            ? 'border-red-200 bg-red-50'
            : 'border-neutral-200 bg-white'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          passed === true
            ? 'bg-green-100 text-green-700'
            : passed === false
              ? 'bg-red-100 text-red-700'
              : 'bg-neutral-100 text-neutral-400'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-neutral-900">{label}</p>
          {passed === true && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Ready
            </span>
          )}
          {passed === false && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Blocked
            </span>
          )}
          {passed === null && (
            <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-neutral-300" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
