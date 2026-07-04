// ─── Event Types ────────────────────────────────────────────────

export const TIMELINE_EVENT_TYPES = [
  'interview:started',
  'interview:ended',
  'recruiter:joined',
  'recruiter:left',
  'candidate:joined',
  'candidate:left',
  'phone:connected',
  'phone:disconnected',
  'camera:enabled',
  'camera:disabled',
  'microphone:enabled',
  'microphone:disabled',
  'waiting-room:joined',
  'waiting-room:left',
  'webrtc:connected',
  'webrtc:disconnected',
  'candidate:reconnected',
  'recruiter:reconnected',
  'device:verified',
  'interview:status-updated',
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

// ─── Severity ───────────────────────────────────────────────────

export const TIMELINE_SEVERITIES = ['INFO', 'SUCCESS', 'WARNING', 'ERROR'] as const;
export type TimelineSeverity = (typeof TIMELINE_SEVERITIES)[number];

// ─── Event ──────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  sessionId: string;
  eventType: TimelineEventType;
  severity: TimelineSeverity;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── API response shapes ────────────────────────────────────────

export interface TimelineListData {
  events: TimelineEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TimelineDetailData {
  event: TimelineEvent;
}

export interface TimelineExportData {
  events: TimelineEvent[];
}

// ─── Query params ───────────────────────────────────────────────

export interface TimelineListParams {
  page?: number;
  limit?: number;
  eventType?: TimelineEventType;
  severity?: TimelineSeverity;
  search?: string;
  sort?: 'newest' | 'oldest';
}

// ─── Socket event shape (server pushes timeline:event) ──────────

export interface TimelineSocketEvent {
  eventType: TimelineEventType;
  severity: TimelineSeverity;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Icon / display helpers ─────────────────────────────────────

export const EVENT_ICONS: Record<TimelineEventType, string> = {
  'interview:started': '🎬',
  'interview:ended': '🏁',
  'recruiter:joined': '👤',
  'recruiter:left': '🚪',
  'candidate:joined': '👥',
  'candidate:left': '🚶',
  'phone:connected': '📱',
  'phone:disconnected': '📵',
  'camera:enabled': '📷',
  'camera:disabled': '🚫📷',
  'microphone:enabled': '🎤',
  'microphone:disabled': '🔇',
  'waiting-room:joined': '🪑',
  'waiting-room:left': '🚶',
  'webrtc:connected': '🔗',
  'webrtc:disconnected': '🔗',
  'candidate:reconnected': '🔄',
  'recruiter:reconnected': '🔄',
  'device:verified': '✅',
  'interview:status-updated': '📋',
};

export const EVENT_LABELS: Record<TimelineEventType, string> = {
  'interview:started': 'Interview Started',
  'interview:ended': 'Interview Ended',
  'recruiter:joined': 'Recruiter Joined',
  'recruiter:left': 'Recruiter Left',
  'candidate:joined': 'Candidate Joined',
  'candidate:left': 'Candidate Left',
  'phone:connected': 'Phone Connected',
  'phone:disconnected': 'Phone Disconnected',
  'camera:enabled': 'Camera Enabled',
  'camera:disabled': 'Camera Disabled',
  'microphone:enabled': 'Microphone Enabled',
  'microphone:disabled': 'Microphone Disabled',
  'waiting-room:joined': 'Waiting Room Joined',
  'waiting-room:left': 'Waiting Room Left',
  'webrtc:connected': 'WebRTC Connected',
  'webrtc:disconnected': 'WebRTC Disconnected',
  'candidate:reconnected': 'Candidate Reconnected',
  'recruiter:reconnected': 'Recruiter Reconnected',
  'device:verified': 'Device Verified',
  'interview:status-updated': 'Status Updated',
};

export const SEVERITY_COLORS: Record<TimelineSeverity, string> = {
  INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  SUCCESS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  WARNING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const SEVERITY_BORDER: Record<TimelineSeverity, string> = {
  INFO: 'border-l-blue-400',
  SUCCESS: 'border-l-emerald-400',
  WARNING: 'border-l-amber-400',
  ERROR: 'border-l-red-400',
};
