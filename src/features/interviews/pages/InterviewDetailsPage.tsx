import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  useInterview,
  useDeleteInterview,
  useGenerateInvite,
  useJoinInterview,
} from '../hooks/useInterviews';
import { StatusBadge } from '../components/StatusBadge';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CopyButton } from '@/components/ui/CopyButton';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function InterviewDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: interview, isLoading, isError, error } = useInterview(id);
  const deleteMutation = useDeleteInterview();
  const generateInvite = useGenerateInvite();
  const joinInterviewMutation = useJoinInterview();
  const [showDelete, setShowDelete] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(
    interview?.inviteToken ?? null,
  );

  const handleDelete = useCallback(() => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/interviews'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, deleteMutation, navigate]);

  const handleGenerateInvite = useCallback(() => {
    if (!id) return;
    generateInvite.mutate(id, {
      onSuccess: (res) => {
        setInviteToken(res.data.inviteToken);
      },
    });
  }, [id, generateInvite]);

  const handleJoinInterview = useCallback(() => {
    if (!id) return;
    joinInterviewMutation.mutate(id, {
      onSuccess: () => {
        console.log('[Recruiter] Join interview API success — navigating to session page');
        toast.success('Joining interview...');
        navigate(`/session/${id}?join=true`);
      },
    });
  }, [id, joinInterviewMutation, navigate]);

  const inviteLink = inviteToken
    ? `${window.location.origin}/candidate/join/${inviteToken}`
    : null;

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !interview) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">Interview not found</p>
          <p className="mt-1 text-sm text-red-500">
            {(error as { message?: string })?.message ?? 'This interview does not exist.'}
          </p>
          <Link
            to="/interviews"
            className="mt-4 inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Back to interviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/interviews"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to interviews
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/interviews/${interview.id}/edit`}
            className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="rounded-xl border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Detail card */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                {interview.title}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Created {formatDate(interview.createdAt)}
              </p>
            </div>
            <StatusBadge status={interview.status} />
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <Section title="Candidate">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Name" value={interview.candidateName} />
              <DetailItem label="Email" value={interview.candidateEmail} />
              {interview.candidatePhone && (
                <DetailItem label="Phone" value={interview.candidatePhone} />
              )}
            </div>
          </Section>

          <Section title="Interview">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Date"
                value={formatPrettyDate(interview.date)}
              />
              <DetailItem label="Time" value={interview.time} />
              <DetailItem label="Duration" value={`${interview.duration} min`} />
              <DetailItem label="Platform" value={interview.meetingPlatform} />
            </div>
          </Section>

          <Section title="Meeting link">
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors break-all"
            >
              {interview.meetingLink}
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          </Section>

          {interview.notes && (
            <Section title="Notes">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {interview.notes}
              </p>
            </Section>
          )}

          {/* Join Interview — Recruiter joins the live WebRTC interview session */}
          <Section title="Live Interview">
            <button
              type="button"
              onClick={handleJoinInterview}
              disabled={joinInterviewMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed cursor-pointer"
            >
              {joinInterviewMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Joining...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Join Interview
                </>
              )}
            </button>
            <span className="ml-3 text-xs text-neutral-400">
              Start live video interview with the candidate
            </span>
          </Section>

          {/* Phone Session — always available, not gated on inviteToken */}
          <Section title="Phone Monitoring">
            <Link
              to={`/session/${interview.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Start Phone Session
            </Link>
            <span className="ml-3 text-xs text-neutral-400">
              Generate QR code for phone camera monitoring
            </span>
          </Section>

          {/* Invitation */}
          <Section title="Candidate Invitation">
            {inviteLink ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5">
                  <span className="flex-1 truncate text-sm text-neutral-600">
                    {inviteLink}
                  </span>
                  <CopyButton text={inviteLink} />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateInvite}
                  disabled={generateInvite.isPending}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer disabled:text-neutral-300"
                >
                  Regenerate link
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateInvite}
                  disabled={generateInvite.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  {generateInvite.isPending && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  Generate Invitation Link
                </button>
                <span className="text-xs text-neutral-400">
                  Create a unique link to send to the candidate
                </span>
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete interview"
        message={
          <p>
            Are you sure you want to delete &ldquo;{interview.title}&rdquo;?
            This action cannot be undone.
          </p>
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatPrettyDate(iso: string): string {
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
