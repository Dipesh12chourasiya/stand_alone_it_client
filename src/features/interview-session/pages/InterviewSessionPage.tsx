import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sessionApi } from '../api/session.api';
import { useSocket } from '../hooks/useSocket';
import { useInterviewRoom } from '../hooks/useInterviewRoom';
import { usePhoneConnection } from '../hooks/usePhoneConnection';
import { useWebRTC } from '../hooks/useWebRTC';
import { useSessionStore } from '../store/session.store';
import { QRCard } from '../components/QRCard';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { VideoPlayer } from '../components/VideoPlayer';
import { PhoneStatus } from '../components/PhoneStatus';
import { WaitingCard } from '../components/WaitingCard';
import { InterviewSessionLayout } from '../components/InterviewSessionLayout';
import type { PhoneSession, ApiEnvelope } from '../types/session.types';

/**
 * Recruiter's interview session page.
 *
 * Displays the QR code for phone pairing, realtime connection status,
 * and the phone camera feed once WebRTC establishes.
 *
 * Session creation is idempotent: the server reuses an existing active
 * session if one exists, so we create immediately on mount without a
 * separate "check for existing" query.
 */
export function InterviewSessionPage() {
  const { id: interviewId } = useParams<{ id: string }>();
  const [session, setSession] = useState<PhoneSession | null>(null);
  const [sessionUrl, setSessionUrl] = useState('');

  const {
    phoneStatus,
    phoneDeviceInfo,
    webrtcState,
    remoteStream,
    setPhoneStatus,
    setRemoteStream,
  } = useSessionStore();

  // Socket connection
  const { socket } = useSocket({
    enabled: true,
    onConnect: () => console.log('[Session] Socket connected'),
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

  // Join interview room
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
    },
    onParticipantLeft: (data) => {
      console.log('[Recruiter] Participant left:', data.role);
      if (data.role === 'phone') {
        setPhoneStatus('disconnected');
        toast('Phone disconnected.');
      }
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

  // WebRTC: receive phone camera stream
  useWebRTC({
    socket,
    localStream: null, // Recruiter doesn't send their camera
    role: 'recruiter',
    remoteRole: 'phone',
    onRemoteStream: (stream) => setRemoteStream(stream),
  });

  const handleRegenerateQR = useCallback(() => {
    if (interviewId && !creatingSession) {
      createSession();
    }
  }, [interviewId, createSession, creatingSession]);

  if (creatingSession && !session) {
    return <WaitingCard message="Generating QR code..." icon="phone" />;
  }

  const sidebar = (
    <div className="space-y-4">
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
          className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Regenerate QR
        </button>
      )}

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
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Phone Camera Feed
        </h2>
        <VideoPlayer
          stream={remoteStream}
          label="Phone Camera"
        />
      </div>
    </>
  );

  return <InterviewSessionLayout sidebar={sidebar} main={main} />;
}
