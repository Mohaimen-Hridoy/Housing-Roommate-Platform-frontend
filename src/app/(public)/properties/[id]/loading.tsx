import { DetailSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page space-y-8 py-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-9 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="space-y-3">
        <Skeleton className="aspect-[16/10] w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <DetailSkeleton lines={5} />
          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-6 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="mt-6 h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
