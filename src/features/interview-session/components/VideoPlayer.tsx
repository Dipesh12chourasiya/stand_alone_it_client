import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  className?: string;
  label?: string;
}

/**
 * Renders a remote video stream (e.g., the phone's camera on the recruiter's screen).
 * Not mirrored, not muted by default.
 */
export function VideoPlayer({ stream, className = '', label }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-900 ${className || 'aspect-video w-full max-w-2xl'}`}
      >
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm">Waiting for video stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full rounded-lg bg-black object-contain"
      />
      {label && (
        <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
          {label}
        </span>
      )}
    </div>
  );
}
