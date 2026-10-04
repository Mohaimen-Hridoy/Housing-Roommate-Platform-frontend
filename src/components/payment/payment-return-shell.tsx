import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentReturnShellProps {
  title: string;
  description: string;
  tone?: "warning" | "danger";
  primaryHref?: string;
  primaryLabel?: string;
  children?: React.ReactNode;
}

/** Shared layout for Stripe return pages that cannot resolve a booking. */
export function PaymentReturnShell({
  title,
  description,
  tone = "warning",
  primaryHref = "/dashboard/bookings",
  primaryLabel = "Go to my bookings",
  children,
}: PaymentReturnShellProps) {
  const toneClass =
    tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning";

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-4 p-8 text-center">
          <span className={`mx-auto flex size-12 items-center justify-center rounded-full ${toneClass}`}>
            <AlertTriangle className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
          {children}
          <div className="flex flex-col justify-center gap-2 pt-2 sm:flex-row">
            <Button asChild>
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
