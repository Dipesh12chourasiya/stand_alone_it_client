// ─── Skeleton block ──────────────────────────────────────────

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-neutral-100 ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── Table rows ──────────────────────────────────────────────

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-4"
        >
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-4 w-32 hidden sm:block" />
          <SkeletonBlock className="h-4 w-28 hidden md:block" />
          <SkeletonBlock className="h-4 w-24 hidden lg:block" />
          <SkeletonBlock className="h-6 w-20" />
          <SkeletonBlock className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── Detail page ─────────────────────────────────────────────

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SkeletonBlock className="h-8 w-64" />
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
        <div className="border-t border-neutral-100 pt-4">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Form page ───────────────────────────────────────────────

export function FormSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <SkeletonBlock className="h-8 w-48" />
      <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        ))}
        <SkeletonBlock className="h-10 w-full" />
      </div>
    </div>
  );
}
