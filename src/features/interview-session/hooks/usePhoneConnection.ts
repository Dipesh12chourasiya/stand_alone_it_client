import { useEffect, useCallback, useRef } from 'react';
import { type Socket } from 'socket.io-client';
import { useSessionStore } from '../store/session.store';
import type { PhoneStatusUpdate } from '../types/session.types';

interface UsePhoneConnectionOptions {
  socket: Socket | null;
  sessionToken: string | null;
  interviewId?: string | null;
  role: 'recruiter' | 'phone';
  onPhoneConnected?: () => void;
  onPhoneDisconnected?: () => void;
}

/**
 * Manage the phone connection lifecycle over Socket.IO.
 *
 * Recruiter side: listens for phone status updates.
 * Phone side: joins the session room and sends device info.
 */
export function usePhoneConnection({
  socket,
  sessionToken,
  interviewId,
  role,
  onPhoneConnected,
  onPhoneDisconnected,
}: UsePhoneConnectionOptions) {
  const {
    setPhoneStatus,
    setPhoneDeviceInfo,
  } = useSessionStore();

  // Stable refs for callbacks — prevents stale closures in socket listeners
  const onPhoneConnectedRef = useRef(onPhoneConnected);
  onPhoneConnectedRef.current = onPhoneConnected;

  const onPhoneDisconnectedRef = useRef(onPhoneDisconnected);
  onPhoneDisconnectedRef.current = onPhoneDisconnected;

  // Join/leave session room and listen for phone events
  useEffect(() => {
    if (!socket || !sessionToken) return;

    // Common listeners for BOTH phone and recruiter roles.
    const handleConnected = () => {
      console.log(`[${role === 'phone' ? 'Phone' : 'Recruiter'}] Received phone:connected`);
      setPhoneStatus('connected');
      onPhoneConnectedRef.current?.();
    };

    const handleDisconnected = () => {
      setPhoneStatus('disconnected');
      onPhoneDisconnectedRef.current?.();
    };

    const handleStatus = (data: PhoneStatusUpdate) => {
      setPhoneDeviceInfo(data);
    };

    socket.on('phone:connected', handleConnected);
    socket.on('phone:disconnected', handleDisconnected);
    socket.on('phone:status', handleStatus);
    socket.on('phone:camera-ready', (data: { status: string }) => {
      setPhoneDeviceInfo({ cameraStatus: data.status });
    });
    socket.on('phone:mic-ready', (data: { status: string }) => {
      setPhoneDeviceInfo({ micStatus: data.status });
    });
    socket.on('phone:battery', (data: { level: number; charging: boolean }) => {
      setPhoneDeviceInfo({ battery: data });
    });
    socket.on('phone:network', (data: { type: string }) => {
      setPhoneDeviceInfo({ network: data });
    });

    // Role-specific join action — rejoin on reconnect too
    const doJoin = () => {
      if (role === 'phone') {
        console.log('[Phone] Emitting phone:join-session');
        socket.emit('phone:join-session', {
          sessionToken,
          interviewId: interviewId || undefined,
        });
      }
    };

    console.log(`[${role === 'phone' ? 'Phone' : 'Recruiter'}] Setting up phone connection listeners`);
    doJoin();
    socket.on('connect', doJoin);

    return () => {
      socket.off('phone:connected', handleConnected);
      socket.off('phone:disconnected', handleDisconnected);
      socket.off('phone:status', handleStatus);
      socket.off('phone:camera-ready');
      socket.off('phone:mic-ready');
      socket.off('phone:battery');
      socket.off('phone:network');
      socket.off('connect', doJoin);

      if (role === 'phone') {
        socket.emit('phone:leave-session');
      }
    };
  }, [socket, sessionToken, interviewId, role, setPhoneStatus, setPhoneDeviceInfo]);

  // Phone sends device info updates
  const sendDeviceInfo = useCallback(
    (info: PhoneStatusUpdate) => {
      if (!socket || !sessionToken) return;
      socket.emit('phone:device-info', info);
    },
    [socket, sessionToken],
  );

  return { sendDeviceInfo };
}
