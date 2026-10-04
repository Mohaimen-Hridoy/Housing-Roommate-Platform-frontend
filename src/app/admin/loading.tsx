import { ChartSkeleton, StatCardSkeleton, TableSkeleton } from "@/components/common/skeletons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Skeleton for the admin overview: KPIs, charts and ranking tables. */
export default function AdminOverviewLoading() {
  return (
    <>
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <ChartSkeleton key={index} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-56 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={4} columns={4} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={4} columns={2} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}