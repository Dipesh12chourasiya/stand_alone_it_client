import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
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

  // Create the phone session
  const { mutate: createSession, isPending: creatingSession } = useMutation({
    mutationFn: () => sessionApi.createSession(interviewId!),
    onSuccess: (response: ApiEnvelope<{ session: PhoneSession }>) => {
      const phoneSession = response.data.session;
      setSession(phoneSession);
      setSessionUrl(
        `${window.location.origin}/phone/join/${phoneSession.sessionToken}`,
      );
      toast.success('Phone session created. Scan the QR code.');
    },
    onError: () => {
      toast.error('Failed to create phone session.');
    },
  });

  // Fetch existing session on mount
  const { isLoading: loadingSession, data: activeSession } = useQuery({
    queryKey: ['phone-session', interviewId],
    queryFn: () => sessionApi.getActiveSession(interviewId!),
    enabled: !!interviewId,
    retry: false,
    select: (response: ApiEnvelope<{ session: PhoneSession | null }>) => response.data.session,
  });

  // Restore existing session data when loaded
  useEffect(() => {
    if (!activeSession) return;
    setSession(activeSession);
    setSessionUrl(
      `${window.location.origin}/phone/join/${activeSession.sessionToken}`,
    );
  }, [activeSession]);

  // Join interview room
  useInterviewRoom({
    socket: socket.current,
    interviewId: interviewId || null,
    role: 'recruiter',
    onParticipantJoined: (data) => {
      if (data.role === 'phone') {
        setPhoneStatus('connected');
        toast.success('Phone connected!');
      }
    },
    onParticipantLeft: (data) => {
      if (data.role === 'phone') {
        setPhoneStatus('disconnected');
        toast('Phone disconnected.');
      }
    },
  });

  // Phone connection socket events
  usePhoneConnection({
    socket: socket.current,
    sessionToken: session?.sessionToken || null,
    role: 'recruiter',
    onPhoneConnected: () => setPhoneStatus('connected'),
    onPhoneDisconnected: () => setPhoneStatus('disconnected'),
  });

  // WebRTC: receive phone camera stream
  useWebRTC({
    socket: socket.current,
    localStream: null, // Recruiter doesn't send their camera
    role: 'recruiter',
    remoteRole: 'phone',
    onRemoteStream: (stream) => setRemoteStream(stream),
  });

  // Create session on mount if not already loaded
  useEffect(() => {
    if (interviewId && !session && !creatingSession && !loadingSession) {
      createSession();
    }
  }, [interviewId, session, creatingSession, loadingSession, createSession]);

  const handleRegenerateQR = useCallback(() => {
    if (interviewId) {
      createSession();
    }
  }, [interviewId, createSession]);

  if (loadingSession) {
    return <WaitingCard message="Loading session..." />;
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
