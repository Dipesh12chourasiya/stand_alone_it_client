import type { PhoneConnectionStatus, WebRTCSignalingState } from '../types/session.types';

interface ConnectionStatusProps {
  phoneStatus: PhoneConnectionStatus;
  webrtcState: WebRTCSignalingState;
  className?: string;
}

const STATUS_LABELS: Record<PhoneConnectionStatus, { label: string; color: string }> = {
  disconnected: { label: 'Disconnected', color: 'text-gray-400' },
  connecting: { label: 'Connecting...', color: 'text-yellow-500' },
  connected: { label: 'Connected', color: 'text-green-500' },
  waiting: { label: 'Waiting for phone...', color: 'text-blue-500' },
};

const WEBRTC_LABELS: Record<WebRTCSignalingState, { label: string; color: string }> = {
  idle: { label: 'Idle', color: 'text-gray-400' },
  offering: { label: 'Connecting...', color: 'text-yellow-500' },
  answering: { label: 'Connecting...', color: 'text-yellow-500' },
  connected: { label: 'Streaming', color: 'text-green-500' },
  failed: { label: 'Connection failed', color: 'text-red-500' },
};

/**
 * Status indicator for phone and WebRTC connection states.
 * Shows green/yellow/red dots with labels.
 */
export function ConnectionStatus({
  phoneStatus,
  webrtcState,
  className = '',
}: ConnectionStatusProps) {
  // Fallback to safe defaults if the status value isn't in the lookup dictionary
  const phone = STATUS_LABELS[phoneStatus] ?? { label: 'Unknown', color: 'text-gray-400' };
  const webrtc = WEBRTC_LABELS[webrtcState] ?? { label: 'Unknown', color: 'text-gray-400' };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            phoneStatus === 'connected'
              ? 'bg-green-500'
              : phoneStatus === 'connecting' || phoneStatus === 'waiting'
                ? 'bg-yellow-500'
                : 'bg-gray-400'
          }`}
        />
        <span className={`text-sm ${phone.color}`}>Phone: {phone.label}</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            webrtcState === 'connected'
              ? 'bg-green-500'
              : webrtcState === 'offering' || webrtcState === 'answering'
                ? 'bg-yellow-500'
                : webrtcState === 'failed'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
          }`}
        />
        <span className={`text-sm ${webrtc.color}`}>Stream: {webrtc.label}</span>
      </div>
    </div>
  );
}
