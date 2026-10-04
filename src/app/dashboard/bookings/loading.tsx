import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/common/skeletons";

export default function BookingsLoading() {
  return (
    <>
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-48" />
      </div>

      <TableSkeleton rows={6} columns={6} />
    </>
  );
}