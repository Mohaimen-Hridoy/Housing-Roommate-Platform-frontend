import { StatCardSkeleton, TableSkeleton } from "@/components/common/skeletons";

/** Skeleton for the admin amenities table. */
export default function AdminAmenitiesLoading() {
  return (
    <>
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="h-28 animate-pulse rounded-xl bg-muted/60" />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>

      <TableSkeleton rows={8} columns={4} />
    </>
  );
}