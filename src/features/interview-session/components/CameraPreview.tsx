import { useRef, useEffect } from 'react';

interface CameraPreviewProps {
  stream: MediaStream | null;
  muted?: boolean;
  mirrored?: boolean;
  className?: string;
  label?: string;
}

/**
 * Renders a video element from a MediaStream.
 *
 * Used for both local camera preview (phone, mirrored) and
 * remote stream display (recruiter seeing phone camera, not mirrored).
 */
export function CameraPreview({
  stream,
  muted = true,
  mirrored = false,
  className = '',
  label,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 ${className || 'aspect-video w-full'}`}
      >
        <p className="text-xs text-gray-400">No camera feed</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full rounded-lg object-cover ${
          mirrored ? '-scale-x-100' : ''
        }`}
      />
      {label && (
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
          {label}
        </span>
      )}
    </div>
  );
}
