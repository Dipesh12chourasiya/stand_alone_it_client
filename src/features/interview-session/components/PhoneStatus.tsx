import type { PhoneStatusUpdate } from '../types/session.types';

interface PhoneStatusProps {
  deviceInfo: PhoneStatusUpdate | null;
}

/**
 * Displays phone device status: battery, network, camera/mic state.
 * Renders inline indicators that are useful on the recruiter dashboard.
 */
export function PhoneStatus({ deviceInfo }: PhoneStatusProps) {
  if (!deviceInfo) {
    return (
      <div className="text-xs text-gray-400 italic">
        No device info received yet.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
      {deviceInfo.battery !== undefined && (
        <div className="flex items-center gap-1.5">
          <span>🔋</span>
          <span>
            {deviceInfo.battery.level}%
            {deviceInfo.battery.charging ? ' ⚡' : ''}
          </span>
        </div>
      )}

      {deviceInfo.network !== undefined && (
        <div className="flex items-center gap-1.5">
          <span>📶</span>
          <span>
            {deviceInfo.network.type}
            {deviceInfo.network.effectiveType
              ? ` (${deviceInfo.network.effectiveType})`
              : ''}
          </span>
        </div>
      )}

      {deviceInfo.cameraStatus && (
        <div className="flex items-center gap-1.5">
          <span>📷</span>
          <span
            className={
              deviceInfo.cameraStatus === 'ready'
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }
          >
            Camera: {deviceInfo.cameraStatus}
          </span>
        </div>
      )}

      {deviceInfo.micStatus && (
        <div className="flex items-center gap-1.5">
          <span>🎤</span>
          <span
            className={
              deviceInfo.micStatus === 'ready'
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }
          >
            Mic: {deviceInfo.micStatus}
          </span>
        </div>
      )}
    </div>
  );
}
