import { useEffect, useState, useCallback } from 'react';
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
 */
export function useSocket(options: UseSocketOptions = {}) {
  const { enabled = true, onConnect, onDisconnect: onDisconnectCb, onError } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!enabled) return;

    const instance = getSocket(token || undefined);
    setSocket(instance);
    setConnected(instance.connected);

    if (instance.connected) {
      onConnect?.();
    }

    const handleConnect = () => {
      setSocket(instance);
      setConnected(true);
      onConnect?.();
    };

    const handleDisconnect = (reason: string) => {
      setConnected(false);
      onDisconnectCb?.(reason);
    };

    const handleError = (err: Error) => {
      onError?.(err.message);
    };

    instance.on('connect', handleConnect);
    instance.on('disconnect', handleDisconnect);
    instance.on('connect_error', handleError);

    return () => {
      instance.off('connect', handleConnect);
      instance.off('disconnect', handleDisconnect);
      instance.off('connect_error', handleError);
    };
  }, [enabled, token, onConnect, onDisconnectCb, onError]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setConnected(false);
  }, []);

  return { socket, connected, disconnect };
}
