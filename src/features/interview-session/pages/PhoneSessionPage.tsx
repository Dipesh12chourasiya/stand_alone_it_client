import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSessionStore } from '../store/session.store';
import { useSocket } from '../hooks/useSocket';
import { usePhoneConnection } from '../hooks/usePhoneConnection';
import { useWebRTC } from '../hooks/useWebRTC';
import { useMediaPermissions } from '../hooks/useMediaPermissions';
import { CameraPreview } from '../components/CameraPreview';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { WaitingCard } from '../components/WaitingCard';
import { PhoneStatus } from '../components/PhoneStatus';
import { startCameraStream, stopStream } from '../utils/media';
import { sessionApi } from '../api/session.api';
import type { ApiEnvelope, SessionWithInterview } from '../types/session.types';

/**
 * Phone session page.
 *
 * The device scanning the QR lands here. It opens its camera,
 * sends device info via Socket.IO, initiates WebRTC with the recruiter,
 * and streams its camera feed.
 */
export function PhoneSessionPage() {
  const { sessionToken } = useParams<{ sessionToken: string }>();
  const location = useLocation();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micStream, _setMicStream] = useState<MediaStream | null>(null);
  const cameraTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    phoneStatus,
    phoneDeviceInfo,
    webrtcState,
    remoteStream: _remoteStream,
    setPhoneStatus,
    setWebRTCState: _setWebRTCState,
  } = useSessionStore();

  const { permissions: _permissions } = useMediaPermissions();

  // interviewId from navigation state (lost on page refresh) with API fallback
  const stateInterviewId = (location.state as { interviewId?: string } | null)?.interviewId ?? null;

  const { data: sessionData } = useQuery({
    queryKey: ['phone-session', sessionToken],
    queryFn: () => sessionApi.getSession(sessionToken!),
    enabled: !stateInterviewId && !!sessionToken,
    retry: false,
    select: (response: ApiEnvelope<{ session: SessionWithInterview }>) => response.data.session,
  });

  const interviewId = stateInterviewId ?? sessionData?.interviewId?._id ?? null;

  // Socket connection
  const { socket } = useSocket({
    enabled: true,
    onConnect: () => {
      console.log('[Phone] Socket connected');
      setPhoneStatus('connecting');
    },
    onDisconnect: () => {
      setPhoneStatus('disconnected');
    },
  });

  // Start camera on mount with timeout
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    // Timeout: if camera doesn't start in 15s, show error
    cameraTimeoutRef.current = setTimeout(() => {
      if (!cancelled && !cameraStream) {
        setCameraError('Camera did not start. Please check permissions and try again.');
      }
    }, 15_000);

    async function initMedia() {
      stream = await startCameraStream();
      if (cancelled) return;

      if (cameraTimeoutRef.current) {
        clearTimeout(cameraTimeoutRef.current);
        cameraTimeoutRef.current = null;
      }

      if (stream) {
        setCameraStream(stream);
      } else {
        setCameraError('Could not access camera. Please ensure camera permissions are granted.');
      }
    }

    initMedia();

    return () => {
      cancelled = true;
      if (cameraTimeoutRef.current) {
        clearTimeout(cameraTimeoutRef.current);
        cameraTimeoutRef.current = null;
      }
      if (stream) {
        stopStream(stream);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phone connection socket events
  const { sendDeviceInfo } = usePhoneConnection({
    socket,
    sessionToken: sessionToken || null,
    interviewId,
    role: 'phone',
    onPhoneConnected: () => {
      setPhoneStatus('connected');
      // Send device info once connected
      sendDeviceInfo({
        cameraStatus: cameraStream ? 'ready' : cameraError ? 'error' : 'starting',
        micStatus: micStream ? 'ready' : 'unavailable',
        battery: undefined,
        network: {
          type: navigator.onLine ? 'online' : 'offline',
        },
      });
    },
  });

  // WebRTC: phone sends camera stream to recruiter
  const { createOffer } = useWebRTC({
    socket,
    localStream: cameraStream,
    role: 'phone',
    remoteRole: 'recruiter',
    onRemoteStream: () => {
      // Phone doesn't need the recruiter's stream (optional for future)
    },
  });

  // Initiate WebRTC once camera and socket are ready
  useEffect(() => {
    if (socket?.connected && cameraStream && phoneStatus === 'connected') {
      // Brief delay to ensure socket room is fully joined
      const timer = setTimeout(() => {
        createOffer();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [socket, cameraStream, phoneStatus, createOffer]);

  // Send battery info periodically
  useEffect(() => {
    if (!socket || !sessionToken) return;

    const sendBattery = async () => {
      try {
        const battery = await (navigator as unknown as NavigatorWithBattery).getBattery();
        sendDeviceInfo({
          battery: {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
          },
        });
      } catch {
        // Battery API not supported
      }
    };

    sendBattery();
    const interval = setInterval(sendBattery, 30_000);

    return () => clearInterval(interval);
  }, [socket, sessionToken, sendDeviceInfo]);

  // Camera loading state
  if (!cameraStream && !cameraError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <WaitingCard
          message="Starting camera..."
          icon="camera"
        />
      </div>
    );
  }

  // Camera error state (not a blank page)
  if (cameraError && !cameraStream) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-900 p-8 text-center">
        <div className="text-4xl">📷</div>
        <h2 className="text-lg font-semibold text-white">Camera Unavailable</h2>
        <p className="max-w-sm text-sm text-gray-400">{cameraError}</p>
        <p className="text-xs text-gray-500">
          The recruiter may still start the session without video.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      {/* Camera preview — full screen */}
      <div className="flex flex-1 items-center justify-center p-4">
        <CameraPreview
          stream={cameraStream}
          mirrored
          muted
          label="Your Camera"
          className="w-full max-w-lg"
        />
      </div>

      {/* Status bar */}
      <div className="border-t border-gray-700 bg-gray-800 px-4 py-3">
        <div className="mx-auto flex max-w-lg flex-wrap items-center justify-between gap-4">
          <ConnectionStatus
            phoneStatus={phoneStatus}
            webrtcState={webrtcState}
          />

          {phoneDeviceInfo && (
            <PhoneStatus deviceInfo={phoneDeviceInfo} />
          )}
        </div>
      </div>
    </div>
  );
}

// Battery API types
interface NavigatorWithBattery extends Navigator {
  getBattery(): Promise<{ level: number; charging: boolean }>;
}
