import { useParams } from 'react-router-dom';
import { useWaitingRoom, useJoinInterview } from '../hooks/useCandidate';
import { WaitingStatusCard } from '../components/WaitingStatusCard';
import type { WaitingRoomData, JoinInterviewData } from '../types/candidate.types';

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

export function CandidateWaitingPage() {
  const { token } = useParams<{ token: string }>();

  const {
    data: waitData,
    isLoading: waitLoading,
    isError: waitError,
  } = useWaitingRoom(token!);

  const {
    data: joinData,
    isLoading: joinLoading,
    isError: joinError,
  } = useJoinInterview(token!);

  if (waitLoading || joinLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          <p className="text-sm text-neutral-500">Loading waiting room...</p>
        </div>
      </div>
    );
  }

  if (waitError || joinError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-neutral-900">
            Unable to load
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Could not load the waiting room. The session may have expired.
          </p>
        </div>
      </div>
    );
  }

  const waitingRoom = waitData as WaitingRoomData;
  const interview = joinData as JoinInterviewData;
  const isTerminal =
    waitingRoom?.status === 'InterviewEnded' ||
    waitingRoom?.status === 'Expired';

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-neutral-900">
            Waiting Room
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Your interview session
          </p>
        </div>

        {/* Status card */}
        <WaitingStatusCard status={waitingRoom?.status} />

        {/* Interview details */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">
            {interview?.title ?? 'Interview'}
          </h2>

          <div className="mt-4 space-y-3">
            <Row
              label="Candidate"
              value={interview?.candidateName ?? '—'}
            />
            <Row
              label="Date"
              value={interview?.date ? formatDate(interview.date as string) : '—'}
            />
            <Row
              label="Time"
              value={interview?.time ?? '—'}
            />
            <Row
              label="Duration"
              value={
                interview?.duration
                  ? `${interview.duration} minutes`
                  : '—'
              }
            />
          </div>
        </div>

        {/* Meeting link (once started) */}
        {waitingRoom?.status === 'InterviewStarted' && interview?.meetingLink && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-green-900">
              Meeting Link
            </h3>
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-600 transition-colors break-all"
            >
              {interview.meetingLink}
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        )}

        {/* Auto-refresh indicator */}
        {!isTerminal && (
          <p className="text-center text-xs text-neutral-400">
            This page updates automatically.
          </p>
        )}
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
