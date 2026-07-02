import type { WaitingRoomStatus } from '../types/candidate.types';

interface WaitingStatusCardProps {
  status: WaitingRoomStatus | undefined;
}

const statusConfig: Record<
  WaitingRoomStatus,
  { label: string; color: string; dot: string; pulse: boolean }
> = {
  Waiting: {
    label: 'Waiting for recruiter',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    dot: 'bg-amber-400',
    pulse: true,
  },
  RecruiterJoined: {
    label: 'Recruiter has joined',
    color: 'text-green-700 bg-green-50 border-green-200',
    dot: 'bg-green-500',
    pulse: false,
  },
  InterviewStarted: {
    label: 'Interview in progress',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
    pulse: false,
  },
  InterviewEnded: {
    label: 'Interview ended',
    color: 'text-neutral-600 bg-neutral-50 border-neutral-200',
    dot: 'bg-neutral-400',
    pulse: false,
  },
  Expired: {
    label: 'Session expired',
    color: 'text-red-700 bg-red-50 border-red-200',
    dot: 'bg-red-500',
    pulse: false,
  },
};

export function WaitingStatusCard({ status }: WaitingStatusCardProps) {
  if (!status) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  const config = statusConfig[status] ?? statusConfig.Waiting;

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-6 shadow-sm ${config.color}`}
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        {config.pulse && (
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-300 opacity-40" />
        )}
        <span className={`relative h-4 w-4 rounded-full ${config.dot}`} />
      </div>

      <div>
        <p className="text-sm font-semibold">{config.label}</p>
        <p className="mt-0.5 text-xs opacity-80">
          {status === 'Waiting'
            ? 'Please wait while the recruiter joins the session.'
            : status === 'RecruiterJoined'
              ? 'The recruiter is here. The interview will begin shortly.'
              : status === 'InterviewStarted'
                ? 'Your interview is now active.'
                : status === 'InterviewEnded'
                  ? 'Thank you for attending the interview.'
                  : 'This session is no longer available.'}
        </p>
      </div>
    </div>
  );
}
