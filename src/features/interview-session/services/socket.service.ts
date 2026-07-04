import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Get or create the singleton Socket.IO connection.
 *
 * If a token is provided (recruiter), it is sent as auth so the server
 * can identify the user. The phone connects without a token.
 */
export function getSocket(token?: string): Socket {
  if (!socket?.connected) {
    socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.warn(`[Socket] Reconnect attempt ${attempt}`);
    });
  }

  return socket;
}

/**
 * Disconnect the socket and reset the reference.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
