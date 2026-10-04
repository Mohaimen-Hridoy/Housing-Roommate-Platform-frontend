import Link from "next/link";
import { ArrowRight, CreditCard, RotateCcw } from "lucide-react";

import { PaymentReturnShell } from "@/components/payment/payment-return-shell";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiDataSafe } from "@/lib/api/server";
import type { CheckoutReturnStatus } from "@/lib/types/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment cancelled",
  description: "A Stripe checkout was cancelled. Your booking is unchanged and nothing was charged.",
  robots: { index: false },
};

interface PaymentCancelPageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

/**
 * Stripe cancel return. Mirrors the success page: the backend's public
 * `GET /bookings/:id/cancel` endpoint reports state without requiring a token.
 */
export default async function PaymentCancelPage({ searchParams }: PaymentCancelPageProps) {
  const params = await searchParams;
  const bookingId = params.bookingId;

  if (!bookingId) {
    return (
      <PaymentReturnShell
        title="Checkout cancelled"
        description="No booking reference was included in the cancel link, so there is nothing to reconcile. Your booking and payment records are untouched."
      />
    );
  }

  const checkout = await apiDataSafe<CheckoutReturnStatus>(`/bookings/${bookingId}/cancel`);
  const state = checkout.data;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
              <CreditCard className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Checkout cancelled</h1>
              <p className="text-sm text-muted-foreground">
                {state?.message ??
                  "The Stripe Checkout session was abandoned. No payment was taken and your booking is unchanged."}
              </p>
            </div>
          </div>

          <dl className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Booking reference</dt>
              <dd className="font-mono text-xs">{bookingId}</dd>
            </div>
            {state?.paymentStatus ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Payment status</dt>
                <dd>
                  <PaymentStatusBadge status={state.paymentStatus} />
                </dd>
              </div>
            ) : null}
            {state?.bookingStatus ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Booking status</dt>
                <dd>
                  <BookingStatusBadge status={state.bookingStatus} />
                </dd>
              </div>
            ) : null}
            {state?.roomStatus ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Room status</dt>
                <dd className="font-medium">{state.roomStatus.toLowerCase()}</dd>
              </div>
            ) : null}
          </dl>

          <Separator />

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What happens next</p>
            <ul className="space-y-1.5">
              <li>· Your booking stays approved and the room stays reserved for you.</li>
              <li>· You can reopen the Stripe Checkout session from the booking page at any time.</li>
              <li>· If you would rather not proceed, cancel the booking — a succeeded payment is refunded automatically.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={`/dashboard/bookings/${bookingId}`}>
                <RotateCcw />
                Retry payment
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/bookings">All my bookings</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/properties">
                Keep exploring
                <ArrowRight />
              </Link>
            </Button>
          </div>

          {checkout.error ? (
            <p className="text-xs text-muted-foreground">
              Live status unavailable ({checkout.error}). The booking page remains authoritative.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
