import { Building2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="container-page py-10">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-5 w-[34rem] max-w-full" />
      </div>

      <div className="mt-6 flex gap-2 border-b border-border pb-3">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <Skeleton className="h-10 flex-1" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="size-4" aria-hidden="true" />
        <Skeleton className="h-4 w-40" />
      </div>

      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className="overflow-hidden rounded-xl border border-border bg-card">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-28" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}