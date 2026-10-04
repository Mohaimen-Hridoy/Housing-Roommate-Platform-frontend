import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ListSkeleton } from "@/components/common/skeletons";

export default function MessageThreadLoading() {
  return (
    <>
      <Skeleton className="h-4 w-40" />

      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-start">
              <Skeleton className="h-16 w-2/3 rounded-2xl" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-20 w-2/3 rounded-2xl" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-14 w-1/2 rounded-2xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <ListSkeleton rows={1} />
        </CardContent>
      </Card>
    </>
  );
}