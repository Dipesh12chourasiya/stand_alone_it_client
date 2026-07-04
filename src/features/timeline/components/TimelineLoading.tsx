/**
 * Skeleton loading state for the timeline panel.
 * Renders 5 placeholder rows that mimic actual timeline entries.
 */
export function TimelineLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 pl-10 relative">
          <div className="absolute left-0 top-0 h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
          {i < 4 && (
            <div className="absolute left-[17px] top-6 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
          )}
          <div className="flex-1 space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
