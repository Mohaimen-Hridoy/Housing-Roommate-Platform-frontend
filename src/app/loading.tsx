import { PropertyGridSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-dvh">
      <div className="border-b border-border">
        <div className="container-page flex h-16 items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="hidden gap-3 md:flex">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-20" />
            ))}
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      <div className="container-page space-y-8 py-10">
        <div className="space-y-3">
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <PropertyGridSkeleton count={6} />
      </div>
    </div>
  );
}
