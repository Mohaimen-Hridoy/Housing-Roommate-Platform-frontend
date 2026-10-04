"use client";

import { AlertTriangle, LayoutDashboard, RotateCcw, Users } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdminErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for every `/admin` segment. A failed render or an unhandled
 * Server Component crash keeps the admin inside the console with a way out.
 */
export default function AdminErrorPage({ error, reset }: AdminErrorPageProps) {
  useEffect(() => {
    console.error("[admin-error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="p-8 sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">The admin console hit an error</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            This panel could not be rendered. It is usually a transient API problem — retry, and if it keeps
            failing check the backend logs for the request below.
          </p>

          <p className="mt-4 break-words rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">
            {error.message}
          </p>
          {error.digest ? <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p> : null}

          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={reset}>
              <RotateCcw />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">
                <LayoutDashboard />
                Back to overview
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/admin/users">
                <Users />
                Users
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}