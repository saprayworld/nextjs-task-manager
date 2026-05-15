import { Skeleton } from "@/components/ui/skeleton";

// จำลอง Skeleton ของ Recurring Item 1 งาน
function RecurringItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Skeleton className="h-4 w-40 sm:w-48" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-8 w-8 sm:w-16 rounded-md" />
        <Skeleton className="h-8 w-8 sm:w-16 rounded-md" />
        <Skeleton className="h-8 w-8 sm:w-16 rounded-md" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-6 w-24 sm:w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48 sm:w-64" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          {/* Create button */}
          <Skeleton className="h-9 w-20 sm:w-32 shrink-0 rounded-md" />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0 pb-6">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecurringItemSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
