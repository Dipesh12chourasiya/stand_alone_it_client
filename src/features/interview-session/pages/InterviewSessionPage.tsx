import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sessionApi } from '../api/session.api';
import { interviewApi } from '@/features/interviews/api/interview.api';
import { useSocket } from '../hooks/useSocket';
import { useInterviewRoom } from '../hooks/useInterviewRoom';
import { usePhoneConnection } from '../hooks/usePhoneConnection';
import { useWebRTC } from '../hooks/useWebRTC';
import { useSessionStore } from '../store/session.store';
import { startCameraStream, stopStream } from '../utils/media';
import { QRCard } from '../components/QRCard';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { VideoPlayer } from '../components/VideoPlayer';
import { CameraPreview } from '../components/CameraPreview';
import { PhoneStatus } from '../components/PhoneStatus';
import { WaitingCard } from '../components/WaitingCard';
import { InterviewSessionLayout } from '../components/InterviewSessionLayout';
import type { PhoneSession, ApiEnvelope } from '../types/session.types';

/**
 * Recruiter's interview session page.
 *
 * Two modes:
 *   1. CANDIDATE INTERVIEW — recruiter clicks "Join Interview", joins the
 *      WebRTC room as offerer, and conducts a live video interview.
 *   2. PHONE MONITORING — generates a QR code for phone camera monitoring
 *      (existing feature).
 */
export function InterviewSessionPage() {
  const { id: interviewId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<PhoneSession | null>(null);
  const [sessionUrl, setSessionUrl] = useState('');
  const autoJoinTriggeredRef = useRef(false);

  // Candidate interview mode state
  const [interviewMode, setInterviewMode] = useState<'idle' | 'joining' | 'waiting' | 'candidate-ready' | 'webrtc-connected'>('idle');
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null);

  const {
    phoneStatus,
    phoneDeviceInfo,
    webrtcState,
    remoteStream,
    setPhoneStatus,
    setRemoteStream,
    setWebRTCState,
    setLocalStream,
  } = useSessionStore();

  // Socket connection
  const { socket } = useSocket({
    enabled: true,
    onConnect: () => console.log('[Session] Socket connected'),
    onDisconnect: () => {
      if (interviewMode !== 'idle') {
        setInterviewMode('idle');
      }
    },
  });

  // Create (or reuse) the phone session — runs once on mount
  const { mutate: createSession, isPending: creatingSession } = useMutation({
    mutationFn: () => sessionApi.createSession(interviewId!),
    onSuccess: (response: ApiEnvelope<{ session: PhoneSession }>) => {
      const phoneSession = response.data.session;
      setSession(phoneSession);
      setSessionUrl(
        `${window.location.origin}/phone/join/${phoneSession.sessionToken}`,
      );
    },
    onError: () => {
      toast.error('Failed to create phone session.');
    },
  });

  // Create session immediately on mount (server reuses existing if valid)
  useEffect(() => {
    if (interviewId && !session && !creatingSession) {
      createSession();
    }
  }, [interviewId, session, creatingSession, createSession]);

  // Join interview room (for both phone and candidate flows)
  useInterviewRoom({
    socket,
    interviewId: interviewId || null,
    role: 'recruiter',
    onParticipantJoined: (data) => {
      console.log('[Recruiter] Participant joined:', data.role);
      if (data.role === 'phone') {
        setPhoneStatus('connected');
        toast.success('Phone connected!');
      }
      if (data.role === 'candidate') {
        console.log('[Recruiter] Candidate joined interview room');
        setInterviewMode('candidate-ready');
        toast.success('Candidate is ready!');
      }
    },
    onParticipantLeft: (data) => {
      console.log('[Recruiter] Participant left:', data.role);
      if (data.role === 'phone') {
        setPhoneStatus('disconnected');
        toast('Phone disconnected.');
      }
      if (data.role === 'candidate') {
        setInterviewMode('waiting');
        toast('Candidate left the interview.');
      }
    },
    onBothParticipantsReady: () => {
      console.log('[Recruiter] Both participants ready — initiating WebRTC offer');
      setInterviewMode('candidate-ready');
      // createOffer will be triggered by the hook below
    },
  });

  // Phone connection socket events
  usePhoneConnection({
    socket,
    sessionToken: session?.sessionToken || null,
    role: 'recruiter',
    onPhoneConnected: () => setPhoneStatus('connected'),
    onPhoneDisconnected: () => setPhoneStatus('disconnected'),
  });

  // ─── Candidate Interview WebRTC ─────────────────────────────

  const {
    createOffer,
  } = useWebRTC({
    socket,
    localStream: localCameraStream,
    role: 'recruiter',
    remoteRole: 'candidate',
    onRemoteStream: (stream) => {
      console.log('[Recruiter] Remote stream received from candidate');
      setRemoteStream(stream);
      setWebRTCState('connected');
      setInterviewMode('webrtc-connected');
    },
  });

  // When both participants are ready, create WebRTC offer
  useEffect(() => {
    if (interviewMode === 'candidate-ready' && localCameraStream && socket?.connected) {
      console.log('[Recruiter] Creating WebRTC offer for candidate');
      const timer = setTimeout(() => {
        createOffer();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [interviewMode, localCameraStream, socket, createOffer]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (localCameraStream) {
        stopStream(localCameraStream);
      }
    };
  }, [localCameraStream]);

  // ─── Join Interview Handler ──────────────────────────────────

  const { mutate: joinInterview, isPending: joiningInterview } = useMutation({
    mutationFn: () => interviewApi.joinInterview(interviewId!),
    onSuccess: () => {
      toast.success('You have joined the interview.');
      setInterviewMode('waiting');
      // Start local camera
      startCameraStream().then((stream) => {
        if (stream) {
          setLocalCameraStream(stream);
          setLocalStream(stream);
          console.log('[Recruiter] Local camera started');
        } else {
          toast.error('Could not start camera. Please check permissions.');
        }
      });
    },
    onError: () => {
      toast.error('Failed to join the interview. Please try again.');
      setInterviewMode('idle');
    },
  });

  // Auto-join interview when navigated from details page with ?join=true
  useEffect(() => {
    if (
      searchParams.get('join') === 'true' &&
      !autoJoinTriggeredRef.current &&
      interviewId
    ) {
      autoJoinTriggeredRef.current = true;
      console.log('[Recruiter] Auto-join triggered from URL param — joining interview');
      setInterviewMode('joining');
      joinInterview();
    }
    // Only run when interviewId becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, searchParams]);

  const handleJoinInterview = useCallback(() => {
    if (!interviewId) return;
    setInterviewMode('joining');
    joinInterview();
  }, [interviewId, joinInterview]);

  const handleRegenerateQR = useCallback(() => {
    if (interviewId && !creatingSession) {
      createSession();
    }
  }, [interviewId, createSession, creatingSession]);

  // ─── Render ─────────────────────────────────────────────────

  if (creatingSession && !session) {
    return <WaitingCard message="Generating QR code..." icon="phone" />;
  }

  const sidebar = (
    <div className="space-y-4">
      {/* Candidate Interview Section */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
        <h3 className="mb-3 text-sm font-semibold text-green-800 dark:text-green-300">
          Interview Session
        </h3>

        {interviewMode === 'idle' && (
          <button
            onClick={handleJoinInterview}
            disabled={joiningInterview}
            className="w-full cursor-pointer rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {joiningInterview ? 'Joining...' : 'Join Interview'}
          </button>
        )}

        {interviewMode === 'joining' && (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            Joining interview...
          </div>
        )}

        {interviewMode === 'waiting' && (
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
            </span>
            Waiting for candidate to join...
          </div>
        )}

        {interviewMode === 'candidate-ready' && (
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
            </span>
            Candidate present — establishing connection...
          </div>
        )}

        {interviewMode === 'webrtc-connected' && (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Interview connected
          </div>
        )}
      </div>

      {/* Phone Monitoring Section */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
        <h4 className="mb-3 text-sm font-semibold text-blue-800 dark:text-blue-300">
          Phone Monitoring
        </h4>
        {session ? (
          <QRCard
            session={session}
            sessionUrl={sessionUrl}
          />
        ) : (
          <WaitingCard message="Generating QR code..." icon="phone" />
        )}

        {session?.status === 'Pending' && (
          <button
            onClick={handleRegenerateQR}
            className="mt-2 w-full cursor-pointer rounded-lg border border-blue-300 px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            Regenerate QR
          </button>
        )}
      </div>

      {/* Connection status */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Connection Status
        </h4>
        <ConnectionStatus
          phoneStatus={phoneStatus}
          webrtcState={webrtcState}
        />
      </div>

      {phoneDeviceInfo && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Phone Device Info
          </h4>
          <PhoneStatus deviceInfo={phoneDeviceInfo} />
        </div>
      )}
    </div>
  );

  const main = (
    <>
      {/* Candidate video feed */}
      {(interviewMode === 'webrtc-connected' || remoteStream) && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Candidate Video
          </h2>
          <VideoPlayer
            stream={remoteStream}
            label="Candidate Camera"
          />
        </div>
      )}

      {/* Local camera preview (recruiter) */}
      {localCameraStream && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Your Camera
          </h2>
          <CameraPreview
            stream={localCameraStream}
            mirrored
            muted
            label="Your Camera"
          />
        </div>
      )}

      {/* Phone camera feed (existing) */}
      {!remoteStream && interviewMode === 'idle' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Phone Camera Feed
          </h2>
          <VideoPlayer
            stream={null}
            label="Phone Camera"
          />
        </div>
      )}
    </>
  );

  return <InterviewSessionLayout sidebar={sidebar} main={main} />;
}
