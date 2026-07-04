/**
 * Start the user's camera and return the stream.
 * Handles errors gracefully and returns null on failure.
 */
export async function startCameraStream(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
    });
    return stream;
  } catch (err) {
    const reason =
      err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'permission-denied'
        : err instanceof DOMException && err.name === 'NotFoundError'
          ? 'no-camera'
          : 'unknown';

    console.error(`[Media] Camera error: ${reason}`, err);
    return null;
  }
}

/**
 * Start the microphone and return the stream.
 */
export async function startMicStream(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    const reason =
      err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'permission-denied'
        : 'unknown';

    console.error(`[Media] Microphone error: ${reason}`, err);
    return null;
  }
}

/**
 * Stop all tracks in a media stream.
 */
export function stopStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

/**
 * Detect browser info from user agent.
 */
export function getBrowserInfo(): { browser: string; os: string } {
  const ua = navigator.userAgent;

  const browser =
    ua.includes('Chrome') && !ua.includes('Edg')
      ? 'Chrome'
      : ua.includes('Firefox')
        ? 'Firefox'
        : ua.includes('Safari') && !ua.includes('Chrome')
          ? 'Safari'
          : ua.includes('Edg')
            ? 'Edge'
            : 'Unknown';

  const os =
    ua.includes('Windows')
      ? 'Windows'
      : ua.includes('Mac OS')
        ? 'macOS'
        : ua.includes('Android')
          ? 'Android'
          : ua.includes('iOS') || ua.includes('iPhone')
            ? 'iOS'
            : 'Unknown';

  return { browser, os };
}
