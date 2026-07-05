import { useEffect, useState, useCallback, useRef } from 'react';
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
 * Returns a `socket` instance + a `connected` flag so consumers can
 * react to connection state changes (triggers re-renders on connect).
 *
 * CRITICAL: Callback refs keep socket creation stable — inline arrow
 * functions in the calling component do NOT trigger effect re-runs,
 * preventing orphaned socket instances.
 */
export function useSocket(options: UseSocketOptions = {}) {
  const { enabled = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const token = useAuthStore((state) => state.token);

  // Stable refs for callbacks — prevents stale closures AND
  // prevents the effect from re-running when callbacks change
  const onConnectRef = useRef(options.onConnect);
  onConnectRef.current = options.onConnect;

  const onDisconnectRef = useRef(options.onDisconnect);
  onDisconnectRef.current = options.onDisconnect;

  const onErrorRef = useRef(options.onError);
  onErrorRef.current = options.onError;

  useEffect(() => {
    if (!enabled) return;

    const instance = getSocket(token || undefined);
    setSocket(instance);
    setConnected(instance.connected);

    if (instance.connected) {
      onConnectRef.current?.();
    }

    const handleConnect = () => {
      setSocket(instance);
      setConnected(true);
      onConnectRef.current?.();
    };

    const handleDisconnect = (reason: string) => {
      setConnected(false);
      onDisconnectRef.current?.(reason);
    };

    const handleError = (err: Error) => {
      onErrorRef.current?.(err.message);
    };

    instance.on('connect', handleConnect);
    instance.on('disconnect', handleDisconnect);
    instance.on('connect_error', handleError);

    return () => {
      instance.off('connect', handleConnect);
      instance.off('disconnect', handleDisconnect);
      instance.off('connect_error', handleError);
    };
    // Only re-run when enabled or token changes — not on callback refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, token]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setConnected(false);
  }, []);

  return { socket, connected, disconnect };
}
