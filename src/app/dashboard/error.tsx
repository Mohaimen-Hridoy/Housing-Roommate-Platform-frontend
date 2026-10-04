"use client";

import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Error boundary for the tenant area — a crash never leaves a blank screen. */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[tenant-dashboard-error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div className="flex-1 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">This dashboard section failed to load</h2>
          <p className="text-sm text-muted-foreground">
            {error.message || "The request to the API failed."} Retrying usually re-runs the server fetch.
          </p>
          {error.digest ? (
            <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" onClick={reset}>
            <RotateCcw />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <LayoutDashboard />
              Back to overview
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}