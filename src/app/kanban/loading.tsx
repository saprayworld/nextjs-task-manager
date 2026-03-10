import { Skeleton } from "@/components/ui/skeleton";

// จำลอง Skeleton ของ Task Card 1 ใบ
function TaskCardSkeleton({ hasProgress = false }: { hasProgress?: boolean }) {
  return (
    <div className="bg-card p-4 rounded-lg border shadow-sm">
      {/* Tag badge */}
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>

      {/* Title */}
      <Skeleton className="h-4 w-3/4 mb-1" />

      {/* Description (2 lines) */}
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3 mb-4" />

      {/* Progress bar */}
      {hasProgress && (
        <Skeleton className="h-1.5 w-full rounded-full mb-4" />
      )}

      {/* Footer: avatars + metadata */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

// จำลอง Skeleton ของ 1 คอลัมน์
function ColumnSkeleton({
  cardCount,
  dotColorClass,
}: {
  cardCount: number;
  dotColorClass: string;
}) {
  return (
    <div className="flex flex-col w-80 shrink-0 bg-muted/50 border rounded-xl max-h-full">
      {/* Column header */}
      <div className="p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotColorClass}`} />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>

      {/* Task cards */}
      <div className="p-4 pt-0 flex flex-col gap-3 flex-1 pb-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <TaskCardSkeleton key={i} hasProgress={i % 2 === 0} />
        ))}
      </div>
    </div>
  );
}

// สี dot ของแต่ละคอลัมน์ (ตรงกับของจริง)
const columns = [
  { dotColor: "bg-muted-foreground", cards: 4 },
  { dotColor: "bg-primary animate-pulse", cards: 3 },
  { dotColor: "bg-amber-400", cards: 3 },
  { dotColor: "bg-emerald-500", cards: 3 },
];

export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Header skeleton — จำลอง Board header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
        <div>
          <Skeleton className="h-5 w-36 mb-1.5" />
          <Skeleton className="h-3 w-52 hidden sm:block" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Board columns skeleton */}
      <main className="flex-1 overflow-x-auto p-4 sm:p-6 pt-0 pb-6">
        <div className="flex gap-4 sm:gap-6 h-full items-start w-max">
          {columns.map((col, i) => (
            <ColumnSkeleton
              key={i}
              cardCount={col.cards}
              dotColorClass={col.dotColor}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
