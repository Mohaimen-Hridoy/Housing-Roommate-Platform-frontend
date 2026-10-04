"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Route-level error boundary: a crash never leaves the user on a blank page. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app-error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="p-8 sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">We hit an unexpected error</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            The page could not be loaded. This is usually a temporary network or API problem — try again,
            and if it persists the API logs will have the details.
          </p>

          {error.digest ? (
            <p className="mt-3 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
          ) : null}

          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={reset}>
              <RotateCcw />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home />
                Back to home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
