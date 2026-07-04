// ─── Phone Session ─────────────────────────────────────────────

export interface PhoneSession {
  id: string;
  interviewId: string;
  sessionToken: string;
  expiresAt: string;
  status: 'Pending' | 'Connected' | 'Disconnected' | 'Expired';
  phoneConnectedAt?: string;
  phoneDisconnectedAt?: string;
  deviceInfo?: DeviceInfo;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceInfo {
  browser?: string;
  os?: string;
  camera?: string;
  batteryLevel?: number;
  internetType?: string;
}

export interface SessionWithInterview extends Omit<PhoneSession, 'interviewId'> {
  interviewId: {
    _id: string;
    title: string;
    candidateName: string;
    date: string;
    time: string;
    duration: number;
  };
}

// ─── Phone Connection Status ──────────────────────────────────

export type PhoneConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'waiting';

export interface PhoneStatusUpdate {
  battery?: { level: number; charging: boolean };
  network?: { type: string; effectiveType?: string };
  cameraStatus?: string;
  micStatus?: string;
  timestamp?: string;
}

// ─── WebRTC ───────────────────────────────────────────────────

export type WebRTCSignalingState =
  | 'idle'
  | 'offering'
  | 'answering'
  | 'connected'
  | 'failed';

export interface WebRTCOffer {
  sdp: RTCSessionDescriptionInit;
  fromRole: string;
}

export interface WebRTCAnswer {
  sdp: RTCSessionDescriptionInit;
  fromRole: string;
}

export interface WebRTCIceCandidate {
  candidate: RTCIceCandidateInit;
  fromRole: string;
}

// ─── Session UI State ─────────────────────────────────────────

export interface SessionUIState {
  phoneStatus: PhoneConnectionStatus;
  phoneDeviceInfo: PhoneStatusUpdate | null;
  webrtcState: WebRTCSignalingState;
  error: string | null;
  cameraStream: MediaStream | null;
  screenStream: MediaStream | null;
  startSession: () => void;
  stopSession: () => void;
}

// ─── Media Permission State ───────────────────────────────────

export interface MediaPermissionState {
  camera: 'prompt' | 'granted' | 'denied' | 'unavailable';
  microphone: 'prompt' | 'granted' | 'denied' | 'unavailable';
}

// ─── Envelope ─────────────────────────────────────────────────

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}
