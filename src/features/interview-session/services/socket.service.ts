import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config';

let socket: Socket | null = null;
let connecting = false;

/**
 * Get or create the singleton Socket.IO connection.
 *
 * CRITICAL — never orphan a socket instance:
 *   - If the existing socket is connected, reuse it.
 *   - If it's disconnected, reconnect it (don't create a new one).
 *   - Only create a fresh socket when none existed before.
 *
 * If a token is provided (recruiter), it is sent as auth so the server
 * can identify the user. The phone connects without a token.
 */
export function getSocket(token?: string): Socket {
  // Already connected — reuse
  if (socket?.connected) return socket;

  // Exists but disconnected — reconnect instead of creating new
  if (socket) {
    // Only attempt reconnect if we aren't already trying
    if (!socket.connected && socket.io && !connecting) {
      connecting = true;
      socket.connect();
    }
    return socket;
  }

  // No socket yet — create fresh singleton
  connecting = true;
  socket = io(SOCKET_URL, {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
  });

  socket.on('connect', () => {
    connecting = false;
  });

  socket.on('disconnect', () => {
    connecting = false;
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.warn(`[Socket] Reconnect attempt ${attempt}`);
  });

  return socket;
}

/**
 * Disconnect the socket and reset the reference.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connecting = false;
  }
}
