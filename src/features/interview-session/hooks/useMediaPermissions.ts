import { useState, useEffect, useCallback } from 'react';
import type { MediaPermissionState } from '../types/session.types';

interface UseMediaPermissionsReturn {
  permissions: MediaPermissionState;
  requestCamera: () => Promise<boolean>;
  requestMicrophone: () => Promise<boolean>;
  requestBoth: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Check and request camera/microphone permissions.
 *
 * Uses the Permissions API where available, falling back to
 * getUserMedia for browsers that don't support it.
 */
export function useMediaPermissions(): UseMediaPermissionsReturn {
  const [permissions, setPermissions] = useState<MediaPermissionState>({
    camera: 'prompt',
    microphone: 'prompt',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial permission state
  useEffect(() => {
    async function checkPermissions() {
      try {
        // navigator.permissions.query is not available in all browsers
        if (!navigator.permissions?.query) return;

        const cameraStatus = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        const micStatus = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });

        setPermissions({
          camera: cameraStatus.state as MediaPermissionState['camera'],
          microphone: micStatus.state as MediaPermissionState['microphone'],
        });

        cameraStatus.addEventListener('change', () => {
          setPermissions((prev) => ({
            ...prev,
            camera: cameraStatus.state as MediaPermissionState['camera'],
          }));
        });

        micStatus.addEventListener('change', () => {
          setPermissions((prev) => ({
            ...prev,
            microphone: micStatus.state as MediaPermissionState['microphone'],
          }));
        });
      } catch {
        // Permissions API not supported — will use getUserMedia fallback
      }
    }

    checkPermissions();
  }, []);

  const requestCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the test stream immediately — we only needed to know if it works
      stream.getTracks().forEach((track) => track.stop());

      setPermissions((prev) => ({ ...prev, camera: 'granted' }));
      setIsLoading(false);
      return true;
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : err instanceof DOMException && err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : 'Failed to access camera.';

      setPermissions((prev) => ({ ...prev, camera: 'denied' }));
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  const requestMicrophone = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      setPermissions((prev) => ({ ...prev, microphone: 'granted' }));
      setIsLoading(false);
      return true;
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
          : err instanceof DOMException && err.name === 'NotFoundError'
            ? 'No microphone found on this device.'
            : 'Failed to access microphone.';

      setPermissions((prev) => ({ ...prev, microphone: 'denied' }));
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  const requestBoth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());

      setPermissions({
        camera: 'granted',
        microphone: 'granted',
      });
      setIsLoading(false);
      return true;
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera or microphone permission denied.'
          : 'Failed to access camera or microphone.';

      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    permissions,
    requestCamera,
    requestMicrophone,
    requestBoth,
    isLoading,
    error,
  };
}
