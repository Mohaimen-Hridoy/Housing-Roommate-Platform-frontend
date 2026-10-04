import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/** Matches the single centred card on `/payment/success`. */
export default function PaymentSuccessLoading() {
  return (
    <div className="container-page flex min-h-[70dvh] items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>

          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}