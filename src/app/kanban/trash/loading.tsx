import { Skeleton } from "@/components/ui/skeleton";

// จำลอง 1 แถวของตาราง
function TableRowSkeleton() {
  return (
    <tr className="border-b transition-colors">
      {/* Checkbox */}
      <td className="p-4 align-middle">
        <Skeleton className="h-4 w-4 rounded" />
      </td>
      {/* Task ID */}
      <td className="p-4 align-middle">
        <Skeleton className="h-4 w-[72px]" />
      </td>
      {/* Title with tag badge */}
      <td className="p-4 align-middle">
        <div className="flex space-x-2 items-center">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </td>
      {/* Status */}
      <td className="p-4 align-middle">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </td>
      {/* Date */}
      <td className="p-4 align-middle">
        <Skeleton className="h-4 w-24" />
      </td>
      {/* Actions */}
      <td className="p-4 align-middle">
        <Skeleton className="h-8 w-8 rounded" />
      </td>
    </tr>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
        <div>
          <Skeleton className="h-5 w-24 mb-1.5" />
          <Skeleton className="h-3 w-52 hidden sm:block" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Table area */}
      <main className="flex-1 overflow-x-auto p-4 sm:p-6 pt-0 pb-6">
        <div className="space-y-4">
          {/* Toolbar skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Skeleton className="h-8 w-[150px] lg:w-[250px] rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md hidden lg:block" />
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border bg-card">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle">
                    <Skeleton className="h-4 w-4 rounded" />
                  </th>
                  <th className="h-12 px-4 text-left align-middle">
                    <Skeleton className="h-4 w-10" />
                  </th>
                  <th className="h-12 px-4 text-left align-middle">
                    <Skeleton className="h-4 w-12" />
                  </th>
                  <th className="h-12 px-4 text-left align-middle">
                    <Skeleton className="h-4 w-14" />
                  </th>
                  <th className="h-12 px-4 text-left align-middle">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="h-12 px-4 text-left align-middle">
                    <Skeleton className="h-4 w-4" />
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between px-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-[70px] rounded-md" />
              </div>
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-md hidden lg:block" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md hidden lg:block" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
