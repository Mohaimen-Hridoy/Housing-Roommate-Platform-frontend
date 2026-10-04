"use client";

import { AlertTriangle, Building2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OwnerErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Route-level error boundary for `/owner/**` — never leave the owner on a blank page. */
export default function OwnerErrorPage({ error, reset }: OwnerErrorProps) {
  useEffect(() => {
    console.error("[owner-error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="space-y-4 p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">The owner dashboard hit an error</h1>
          <p className="text-sm text-muted-foreground">
            {error.message || "Something went wrong while rendering this page."} This is usually a temporary API or
            network problem.
          </p>
        </div>

        {error.digest ? <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p> : null}

        <div className="flex flex-col justify-center gap-2 pt-2 sm:flex-row">
          <Button type="button" onClick={reset}>
            <RotateCcw />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/owner">
              <Building2 />
              Back to overview
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}