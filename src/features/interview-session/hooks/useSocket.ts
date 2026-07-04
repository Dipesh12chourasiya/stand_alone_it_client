import { useEffect, useRef, useCallback } from 'react';
import { type Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../services/socket.service';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface UseSocketOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: string) => void;
}

/**
 * Connect to the Socket.IO server and manage the connection lifecycle.
 *
 * The recruiter's JWT is sent as auth so the server knows who they are.
 * Returns the connected socket instance.
 */
export function useSocket(options: UseSocketOptions = {}) {
  const { enabled = true, onConnect, onDisconnect: onDisconnectCb, onError } = options;
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket(token || undefined);
    socketRef.current = socket;

    if (socket.connected) {
      onConnect?.();
    }

    socket.on('connect', () => {
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      onDisconnectCb?.(reason);
    });

    socket.on('connect_error', (err) => {
      onError?.(err.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [enabled, token, onConnect, onDisconnectCb, onError]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    socketRef.current = null;
  }, []);

  return { socket: socketRef, disconnect };
}
