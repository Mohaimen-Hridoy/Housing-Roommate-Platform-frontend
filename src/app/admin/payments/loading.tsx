import { StatCardSkeleton, TableSkeleton } from "@/components/common/skeletons";

/** Skeleton for the admin payments table. */
export default function AdminPaymentsLoading() {
  return (
    <>
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="h-16 animate-pulse rounded-lg bg-muted/60" />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>

      <TableSkeleton rows={8} columns={7} />
    </>
  );
}