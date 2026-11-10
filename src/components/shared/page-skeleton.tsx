export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-72 max-w-full rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-surface p-5">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-3 h-7 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="h-64 rounded-xl border border-border bg-surface" />
    </div>
  );
}
