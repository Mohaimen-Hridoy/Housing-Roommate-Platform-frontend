import { ListSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <>
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-10 w-48" />

      <ListSkeleton rows={6} />
    </>
  );
}