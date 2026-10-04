import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/common/skeletons";
import { StatCardGrid, StatCardSkeleton } from "@/components/common/stat-card";

export default function PaymentsLoading() {
  return (
    <>
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <Skeleton className="h-20 w-full rounded-lg" />

      <StatCardGrid>
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </StatCardGrid>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-48" />
      </div>

      <TableSkeleton rows={6} columns={5} />
    </>
  );
}