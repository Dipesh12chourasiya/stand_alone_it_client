import { create } from 'zustand';
import type { PhoneConnectionStatus, WebRTCSignalingState, PhoneStatusUpdate } from '../types/session.types';

/**
 * Global UI state for the interview session.
 *
 * Only realtime/temporary UI state lives here:
 *   - phone connection status
 *   - WebRTC signaling state
 *   - session-level errors
 *
 * Server state (session data, interview data) stays in TanStack Query.
 */
interface SessionStore {
  // Phone connection
  phoneStatus: PhoneConnectionStatus;
  phoneDeviceInfo: PhoneStatusUpdate | null;

  // WebRTC
  webrtcState: WebRTCSignalingState;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;

  // Actions
  setPhoneStatus: (status: PhoneConnectionStatus) => void;
  setPhoneDeviceInfo: (info: PhoneStatusUpdate | null) => void;
  setWebRTCState: (state: WebRTCSignalingState) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  reset: () => void;
}

const initialState = {
  phoneStatus: 'disconnected' as PhoneConnectionStatus,
  phoneDeviceInfo: null as PhoneStatusUpdate | null,
  webrtcState: 'idle' as WebRTCSignalingState,
  remoteStream: null as MediaStream | null,
  localStream: null as MediaStream | null,
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setPhoneStatus: (phoneStatus) => set({ phoneStatus }),

  setPhoneDeviceInfo: (phoneDeviceInfo) => set({ phoneDeviceInfo }),

  setWebRTCState: (webrtcState) => set({ webrtcState }),

  setRemoteStream: (remoteStream) => set({ remoteStream }),

  setLocalStream: (localStream) => set({ localStream }),

  reset: () => set(initialState),
}));
