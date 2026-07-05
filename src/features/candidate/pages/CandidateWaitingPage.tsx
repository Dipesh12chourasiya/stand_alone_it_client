import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWaitingRoom, useJoinInterview } from '../hooks/useCandidate';
import { WaitingStatusCard } from '../components/WaitingStatusCard';
import { useSocket } from '@/features/interview-session/hooks/useSocket';
import { useInterviewRoom } from '@/features/interview-session/hooks/useInterviewRoom';
import { useWebRTC } from '@/features/interview-session/hooks/useWebRTC';
import { useSessionStore } from '@/features/interview-session/store/session.store';
import { VideoPlayer } from '@/features/interview-session/components/VideoPlayer';
import { CameraPreview } from '@/features/interview-session/components/CameraPreview';
import { startCameraStream, stopStream } from '@/features/interview-session/utils/media';
import type { WaitingRoomData, JoinInterviewData } from '../types/candidate.types';

/**
 * Candidate waiting room page.
 *
 * 1. Shows waiting status (Waiting → RecruiterJoined → InterviewStarted)
 * 2. Connects to Socket.IO to join the interview room as 'candidate'
 * 3. When both participants are ready, starts WebRTC as the answerer
 * 4. Transitions to video call once WebRTC is established
 *
 * Falls back to REST polling for waiting room status when socket is not connected.
 */
export function CandidateWaitingPage() {
  const { token } = useParams<{ token: string }>();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [webrtcStarted, setWebrtcStarted] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const {
    remoteStream,
    webrtcState,
    setRemoteStream,
    setWebRTCState,
    setLocalStream,
  } = useSessionStore();

  // REST polling for waiting room status (backup)
  const {
    data: waitData,
    isLoading: waitLoading,
    isError: waitError,
    refetch: refetchWaitingRoom,
  } = useWaitingRoom(token!);

  const {
    data: joinData,
    isLoading: joinLoading,
    isError: joinError,
  } = useJoinInterview(token!);

  // Extract interviewId from REST data
  const waitRoom = waitData as WaitingRoomData | undefined;
  const interview = joinData as JoinInterviewData | undefined;
  const interviewId = waitRoom?.interviewId ?? null;

  // Start camera on mount
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function initMedia() {
      stream = await startCameraStream();
      if (cancelled) return;

      if (stream) {
        cameraStreamRef.current = stream;
        setCameraStream(stream);
        setLocalStream(stream);
        console.log('[Candidate] Camera started');
      } else {
        setCameraError('Could not access camera. Please ensure camera permissions are granted.');
        console.warn('[Candidate] Camera unavailable');
      }
    }

    initMedia();

    return () => {
      cancelled = true;
      stopStream(cameraStreamRef.current);
      cameraStreamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket connection — connect when interviewId is available
  const { socket, connected: socketConnected } = useSocket({
    enabled: !!interviewId && !cameraError,
    onConnect: () => console.log('[Candidate] Socket connected'),
    onDisconnect: () => console.log('[Candidate] Socket disconnected'),
  });

  // Join interview room
  const { startInterview: _startInterview } = useInterviewRoom({
    socket,
    interviewId,
    role: 'candidate',
    onParticipantJoined: (data) => {
      console.log('[Candidate] Participant joined:', data.role);
    },
    onParticipantLeft: (data) => {
      console.log('[Candidate] Participant left:', data.role);
    },
    onBothParticipantsReady: () => {
      console.log('[Candidate] Both participants ready — waiting for WebRTC offer');
      setWebrtcStarted(true);
    },
    onWaitingRoomStatusUpdate: (data) => {
      console.log('[Candidate] Waiting room status update:', data.status);
      // Refetch REST data to update the WaitingStatusCard
      refetchWaitingRoom();
    },
  });

  // Track when room is joined
  useEffect(() => {
    if (socketConnected && interviewId) {
      setRoomJoined(true);
    }
  }, [socketConnected, interviewId]);

  // Clean up socket-related effects
  useEffect(() => {
    if (!socket) return;
    return () => {
      console.log('[Candidate] Cleaning up interview room');
    };
  }, [socket]);

  // ─── WebRTC (Candidate = Answerer) ─────────────────────────

  useWebRTC({
    socket,
    localStream: cameraStream,
    role: 'candidate',
    remoteRole: 'recruiter',
    onRemoteStream: (stream) => {
      console.log('[Candidate] Remote stream received from recruiter');
      setRemoteStream(stream);
      setWebRTCState('connected');
    },
  });

  // ─── Clean up on unmount ────────────────────────────────────

  useEffect(() => {
    return () => {
      stopStream(cameraStreamRef.current);
      cameraStreamRef.current = null;
      setRemoteStream(null);
      setWebRTCState('idle');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render States ─────────────────────────────────────────

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

  const isTerminal =
    waitRoom?.status === 'InterviewEnded' ||
    waitRoom?.status === 'Expired';

  // ─── WebRTC Connected: Show Video Call ──────────────────────

  if (webrtcStarted && webrtcState === 'connected') {
    return (
      <div className="relative flex min-h-dvh flex-col bg-neutral-950">
        {/* Remote video (recruiter) — full screen background */}
        <div className="flex flex-1 items-center justify-center bg-neutral-900 p-4">
          <VideoPlayer stream={remoteStream} label="Recruiter" />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-center gap-4 border-t border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-neutral-400">Connected</span>
          </div>
          <span className="text-xs text-neutral-600">{interview?.title}</span>
        </div>

        {/* Local preview — picture-in-picture */}
        {cameraStream && (
          <div className="absolute bottom-20 right-6 z-10">
            <div className="overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl">
              <CameraPreview
                stream={cameraStream}
                mirrored
                muted
                label="You"
                className="h-36 w-28"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── WebRTC Starting: Transition State ──────────────────────

  if (webrtcStarted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-neutral-900">
            Establishing connection...
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Connecting with the recruiter. This should take a few seconds.
          </p>
        </div>
      </div>
    );
  }

  // ─── Waiting Room: Default State ────────────────────────────

  const effectiveStatus =
    socketConnected && roomJoined && waitRoom?.status === 'Waiting'
      ? 'Waiting' // Already connected via socket, waiting for recruiter
      : waitRoom?.status || 'Waiting';

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

        {/* Status card — shows real-time status */}
        <WaitingStatusCard status={effectiveStatus} />

        {/* Socket connection indicator */}
        {socketConnected && roomJoined && (
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-neutral-500">Connected</span>
          </div>
        )}

        {!socketConnected && interviewId && (
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="text-xs text-neutral-500">Connecting...</span>
          </div>
        )}

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

        {/* Camera preview (candidate's own camera) */}
        {cameraStream && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Your Camera Preview
            </h3>
            <CameraPreview
              stream={cameraStream}
              mirrored
              muted
              label="Your Camera"
              className="mx-auto max-w-sm rounded-xl"
            />
          </div>
        )}

        {cameraError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center shadow-sm">
            <p className="text-sm text-amber-700">{cameraError}</p>
            <p className="mt-1 text-xs text-amber-500">
              The recruiter may still see you without video.
            </p>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}
