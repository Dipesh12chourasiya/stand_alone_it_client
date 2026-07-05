import { useEffect, useCallback } from 'react';
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

  // Join/leave session room and listen for phone events
  useEffect(() => {
    if (!socket || !sessionToken) return;

    // Common listeners for BOTH phone and recruiter roles.
    // The phone needs these because the server emits 'phone:connected'
    // back to the phone socket after processing phone:join-session.
    const handleConnected = () => {
      setPhoneStatus('connected');
      onPhoneConnected?.();
    };

    const handleDisconnected = () => {
      setPhoneStatus('disconnected');
      onPhoneDisconnected?.();
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

    // Role-specific join action
    if (role === 'phone') {
      socket.emit('phone:join-session', {
        sessionToken,
        interviewId: interviewId || undefined,
      });
    }

    return () => {
      socket.off('phone:connected', handleConnected);
      socket.off('phone:disconnected', handleDisconnected);
      socket.off('phone:status', handleStatus);
      socket.off('phone:camera-ready');
      socket.off('phone:mic-ready');
      socket.off('phone:battery');
      socket.off('phone:network');

      if (role === 'phone') {
        socket.emit('phone:leave-session');
      }
    };
  }, [socket, sessionToken, interviewId, role, setPhoneStatus, setPhoneDeviceInfo, onPhoneConnected, onPhoneDisconnected]);

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
