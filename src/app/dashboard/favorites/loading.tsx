import { PropertyGridSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesLoading() {
  return (
    <>
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <PropertyGridSkeleton count={6} />
    </>
  );
}