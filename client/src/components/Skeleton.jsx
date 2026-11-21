export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-200 motion-reduce:animate-none ${className}`} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-slate-100" role="status" aria-label="Loading leads">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="hidden h-4 w-1/6 md:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
