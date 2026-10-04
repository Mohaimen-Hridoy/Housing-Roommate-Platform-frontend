import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { StatCardGrid, StatCardSkeleton } from "@/components/common/stat-card";
import { ListSkeleton } from "@/components/common/skeletons";

export default function DashboardLoading() {
  return (
    <>
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <StatCardGrid>
        {Array.from({ length: 6 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </StatCardGrid>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Card>
          <CardContent className="p-0">
            <ListSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}