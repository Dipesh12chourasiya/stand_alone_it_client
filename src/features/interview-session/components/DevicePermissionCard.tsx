import type { MediaPermissionState } from '../types/session.types';

interface DevicePermissionCardProps {
  permissions: MediaPermissionState;
  onRequestCamera: () => void;
  onRequestMicrophone: () => void;
  onRequestBoth: () => void;
  isLoading: boolean;
  error: string | null;
}

const STATUS_ICON: Record<
  MediaPermissionState['camera'] | MediaPermissionState['microphone'],
  string
> = {
  granted: '✅',
  denied: '❌',
  prompt: '❓',
  unavailable: '🚫',
};

/**
 * Shows camera and microphone permission states with request buttons.
 * Displays errors if permissions are denied or hardware is unavailable.
 */
export function DevicePermissionCard({
  permissions,
  onRequestCamera,
  onRequestMicrophone,
  onRequestBoth,
  isLoading,
  error,
}: DevicePermissionCardProps) {
  const allGranted =
    permissions.camera === 'granted' && permissions.microphone === 'granted';
  const anyDenied =
    permissions.camera === 'denied' || permissions.microphone === 'denied';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Device Permissions
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{STATUS_ICON[permissions.camera]}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Camera</span>
          </div>
          {permissions.camera !== 'granted' && permissions.camera !== 'unavailable' && (
            <button
              onClick={onRequestCamera}
              disabled={isLoading}
              className="cursor-pointer rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              {permissions.camera === 'denied' ? 'Retry' : 'Allow'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{STATUS_ICON[permissions.microphone]}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Microphone
            </span>
          </div>
          {permissions.microphone !== 'granted' &&
            permissions.microphone !== 'unavailable' && (
              <button
                onClick={onRequestMicrophone}
                disabled={isLoading}
                className="cursor-pointer rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                {permissions.microphone === 'denied' ? 'Retry' : 'Allow'}
              </button>
            )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {allGranted && (
        <p className="mt-3 text-xs text-green-600 dark:text-green-400">
          All permissions granted. Ready to connect.
        </p>
      )}

      {anyDenied && (
        <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
          Some permissions are denied. Features may be limited.
        </p>
      )}

      {!allGranted && !anyDenied && (
        <button
          onClick={onRequestBoth}
          disabled={isLoading}
          className="mt-4 w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Requesting...' : 'Allow Camera & Microphone'}
        </button>
      )}
    </div>
  );
}
