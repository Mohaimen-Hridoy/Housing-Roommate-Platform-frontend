import { ListSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardGrid, StatCardSkeleton } from "@/components/common/stat-card";

export default function ReviewsLoading() {
  return (
    <>
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <StatCardGrid>
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </StatCardGrid>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      <ListSkeleton rows={4} />
    </>
  );
}