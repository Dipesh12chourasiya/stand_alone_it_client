/**
 * Shown when there are no timeline events to display.
 * Adapts its message based on whether filters are active.
 */
interface TimelineEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function TimelineEmptyState({
  hasFilters = false,
  onClearFilters,
}: TimelineEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">📋</span>
      <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
        {hasFilters ? 'No matching events' : 'No timeline events yet'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or filter criteria.'
          : 'Timeline events will appear here as the interview progresses.'}
      </p>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
