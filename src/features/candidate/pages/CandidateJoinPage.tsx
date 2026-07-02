import { useParams, Link, useNavigate } from 'react-router-dom';
import { useValidateToken } from '../hooks/useCandidate';

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function CandidateJoinPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useValidateToken(token!);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          <p className="text-sm text-neutral-500">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.valid) {
    const errMsg =
      (error as { message?: string })?.message ??
      'This invitation is invalid or has expired.';

    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-neutral-900">
            Invalid Invitation
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{errMsg}</p>
        </div>
      </div>
    );
  }

  const interview = data.interview;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="mt-3 text-xl font-semibold text-neutral-900">
            You&apos;re invited!
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Please review the interview details below.
          </p>
        </div>

        {/* Interview details */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">
            {interview.title}
          </h2>

          <div className="mt-4 space-y-3">
            <Row label="Candidate" value={interview.candidateName} />
            <Row label="Date" value={formatDate(interview.date)} />
            <Row label="Time" value={interview.time} />
            <Row label="Duration" value={`${interview.duration} minutes`} />
            <Row
              label="Status"
              value={interview.status}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate(`/candidate/verify/${token}`)}
            className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 cursor-pointer"
          >
            Continue to Device Check
          </button>
          <p className="text-center text-xs text-neutral-400">
            By continuing, you&apos;ll be asked for camera and microphone
            permissions.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}
