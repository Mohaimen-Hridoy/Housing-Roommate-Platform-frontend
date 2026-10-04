import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Matches the four cards on `/dashboard/settings`: profile, password, details, sign out. */
export default function SettingsLoading() {
  return (
    <>
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {index === 0 ? <Skeleton className="h-10 w-full" /> : null}
              {index === 3 ? <Skeleton className="h-10 w-40" /> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}