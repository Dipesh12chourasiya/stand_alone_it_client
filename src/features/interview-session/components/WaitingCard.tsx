interface WaitingCardProps {
  message?: string;
  icon?: 'phone' | 'camera' | 'loading';
}

/**
 * Displays a waiting state with spinner and message.
 * Used during connection setup and transitions.
 */
export function WaitingCard({
  message = 'Waiting...',
  icon = 'loading',
}: WaitingCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
      {icon === 'loading' && (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      )}

      {icon === 'phone' && (
        <svg
          className="h-8 w-8 animate-pulse text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      )}

      {icon === 'camera' && (
        <svg
          className="h-8 w-8 animate-pulse text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
