import { Skeleton } from "@/components/ui/skeleton";

function CategoryItemSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Color dot */}
        <Skeleton className="size-4 rounded-full shrink-0" />
        {/* Category name */}
        <Skeleton className="h-4 w-28 sm:w-36" />
        {/* Default or report badge placeholder */}
        <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {/* Toggle switch */}
        <Skeleton className="h-6 w-10 rounded-full" />
        {/* Edit button icon */}
        <Skeleton className="size-8 rounded-md" />
        {/* Delete button icon */}
        <Skeleton className="size-8 rounded-md" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-col h-full container mx-auto p-4 md:p-6 lg:max-w-5xl overflow-y-auto animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-9 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6 w-full max-w-xs justify-start flex gap-1 bg-muted/50 p-1 rounded-lg">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      {/* Categories Card Skeleton */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/10">
          <div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-5 w-24 sm:w-32" />
            </div>
            <Skeleton className="h-3.5 w-56 sm:w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-28 sm:w-32 shrink-0 rounded-md" />
        </div>

        {/* Category List */}
        <div className="divide-y divide-border/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <CategoryItemSkeleton key={i} />
          ))}
        </div>

        {/* Card Footer Summary */}
        <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}
