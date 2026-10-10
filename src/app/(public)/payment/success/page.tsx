import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { PaymentReturnShell } from "@/components/payment/payment-return-shell";
import { PaymentStatusBadge } from "@/components/common/status-badge";
import { BookingStatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiDataSafe } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { PaymentLivePoller } from "@/components/payment/payment-live-poller";
import type { Booking, CheckoutReturnStatus } from "@/lib/types/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment received",
  description: "Stripe has returned you to NestSpace after a booking payment.",
  robots: { index: false },
};

interface PaymentSuccessPageProps {
  searchParams: Promise<{ bookingId?: string; payment_intent?: string }>;
}

/**
 * Stripe success return. The backend exposes a public
 * `GET /bookings/:id/success` endpoint because the browser arrives from Stripe
 * without the bearer token; it deliberately reveals only payment state.
 */
export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const params = await searchParams;
  const bookingId = params.bookingId;
  const intent = params.payment_intent;

  if (!bookingId) {
    return (
      <PaymentReturnShell
        title="We could not identify that payment"
        description="The success link did not include a booking reference. Open the booking from your dashboard to see its current status."
      />
    );
  }

  const [checkout, session] = await Promise.all([
    apiDataSafe<CheckoutReturnStatus>(`/bookings/${bookingId}/success`, { revalidate: false }),
    getSessionUser(),
  ]);

  const booking = session
    ? await apiDataSafe<Booking>(`/bookings/${bookingId}`)
    : { data: null, error: null };

  const state = checkout.data;
  const settled = state?.paymentStatus === "SUCCEEDED";
  const processing =
    !settled && (state?.paymentStatus === "PROCESSING" || state?.paymentStatus === "PENDING");

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-start gap-4">
            <span
              className={
                settled
                  ? "flex size-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
                  : processing
                    ? "flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                    : "flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning"
              }
            >
              {settled ? (
                <CheckCircle2 className="size-6" aria-hidden="true" />
              ) : processing ? (
                <Loader2 className="size-6 animate-spin" aria-hidden="true" />
              ) : (
                <XCircle className="size-6" aria-hidden="true" />
              )}
            </span>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {settled
                  ? "Payment received"
                  : processing
                    ? "Payment is being confirmed"
                    : "Payment status needs a moment"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {state?.message ??
                  "Stripe has returned you to the platform. The payment record is updated by the Stripe webhook."}
              </p>
            </div>
          </div>

          <dl className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Booking reference</dt>
              <dd className="font-mono text-xs">{bookingId}</dd>
            </div>
            {intent ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Payment intent</dt>
                <dd className="truncate font-mono text-xs">{intent}</dd>
              </div>
            ) : null}
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
            {state?.paymentProvider ? (
              <div className="space-y-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Provider</dt>
                <dd>
                  <Badge variant="outline">{state.paymentProvider}</Badge>
                </dd>
              </div>
            ) : null}
          </dl>

          {processing ? (
            <div className="space-y-3">
              <PaymentLivePoller active={processing} />
              <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
                Stripe is finalizing the transaction. NestSpace is automatically checking every 2 seconds — this page will update to <strong>Paid</strong> as soon as Stripe confirms.
              </p>
            </div>
          ) : null}

          {booking.data ? (
            <>
              <Separator />
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Property</dt>
                  <dd className="font-medium">
                    <Link
                      href={`/properties/${booking.data.propertyId}`}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      View listing
                    </Link>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Requested</dt>
                  <dd className="font-medium">{formatDateTime(booking.data.createdAt)}</dd>
                </div>
              </dl>
            </>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={`/dashboard/bookings/${bookingId}`}>View booking details</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/bookings">All my bookings</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/properties">Keep exploring</Link>
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
