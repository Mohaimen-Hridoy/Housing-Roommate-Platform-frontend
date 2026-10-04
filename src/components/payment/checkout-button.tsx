"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { CreditCard, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiClient, errorMessage } from "@/lib/api/client";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import type { Booking, CheckoutSession, Payment } from "@/lib/types/api";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripe(): Promise<Stripe | null> | null {
  if (!STRIPE_PUBLISHABLE_KEY) return null;
  stripePromise ??= loadStripe(STRIPE_PUBLISHABLE_KEY);
  return stripePromise;
}

interface CheckoutButtonProps {
  booking: Booking;
  /** Payments already recorded for this booking, newest first. */
  payments?: Payment[];
  size?: "default" | "sm" | "lg";
  className?: string;
}

const PAID_STATES = new Set(["SUCCEEDED", "REFUNDED", "PARTIALLY_REFUNDED"]);

/**
 * Stripe test-mode checkout for an approved booking.
 *
 * Two real paths, both hitting Stripe:
 *  1. Hosted Checkout — `POST /bookings/:id/checkout` returns a `checkoutUrl`
 *     that sends the payer to Stripe's hosted page.
 *  2. Payment Element — when the booking exposes a PaymentIntent
 *     `clientSecret`, the payment is confirmed in-app and the frontend owns the
 *     return navigation to `/payment/success`.
 *
 * The backend's provider is `MOCK` when Stripe is disabled server-side; that
 * case is reported honestly instead of pretending a card was charged.
 */
export function CheckoutButton({ booking, payments = [], size = "default", className }: CheckoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [needsReload, setNeedsReload] = useState(false);

  const latestPayment = payments[0] ?? null;
  const alreadyPaid = latestPayment ? PAID_STATES.has(latestPayment.status) : false;

  const stripe = useMemo(() => getStripe(), []);

  useEffect(() => {
    if (!latestPayment?.clientSecret) return;
    if (latestPayment.provider !== "STRIPE") return;
    if (PAID_STATES.has(latestPayment.status)) return;
    setClientSecret(latestPayment.clientSecret);
  }, [latestPayment]);

  async function startCheckout() {
    setStarting(true);
    try {
      const result = await apiClient<CheckoutSession>(`/bookings/${booking.id}/checkout`, { method: "POST" });
      const data = result.data;

      if (data.provider === "MOCK") {
        setNeedsReload(true);
        toast.success("Payment already settled", {
          description:
            "This backend runs with Stripe disabled, so the booking was marked paid without contacting Stripe. Enable STRIPE_ENABLED with test keys on the API to exercise the real gateway.",
        });
        router.refresh();
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }

      // Stripe is enabled but no hosted URL was issued — fall back to the
      // in-app Payment Element when a client secret is available.
      if (data.clientSecret || clientSecret) {
        setOpen(true);
        return;
      }

      toast.error("Stripe did not return a checkout session", {
        description: "The API reported the STRIPE provider without a checkout URL or client secret.",
      });
    } catch (error) {
      toast.error("Could not start the payment", { description: errorMessage(error) });
    } finally {
      setStarting(false);
    }
  }

  if (alreadyPaid) {
    return (
      <Button variant="success" size={size} className={className} disabled>
        <ShieldCheck />
        Payment complete
      </Button>
    );
  }

  return (
    <>
      <Button size={size} className={className} onClick={() => void startCheckout()} loading={starting}>
        <CreditCard />
        Pay {formatCurrency(booking.totalAmount, booking.currency)} with Stripe
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete your payment</DialogTitle>
            <DialogDescription>
              {formatCurrency(booking.totalAmount, booking.currency)} for booking {booking.id.slice(-8)}
            </DialogDescription>
          </DialogHeader>

          {stripe && clientSecret ? (
            <Elements
              stripe={stripe}
              options={{
                clientSecret,
                appearance: {
                  variables: {
                    colorPrimary: "hsl(221 83% 45%)",
                    colorBackground: "hsl(0 0% 100%)",
                    colorText: "hsl(222 47% 11%)",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <InlinePaymentForm
                bookingId={booking.id}
                onDone={() => {
                  setOpen(false);
                  router.push(`/payment/success?bookingId=${booking.id}`);
                  router.refresh();
                }}
              />
            </Elements>
          ) : (
            <p className="text-sm text-muted-foreground">
              Stripe.js is not configured. Set{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
              to enable the in-app payment form.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {needsReload ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ExternalLink className="size-3.5" aria-hidden="true" />
          Reload the booking to see the settled payment record.
        </p>
      ) : null}
    </>
  );
}

interface InlinePaymentFormProps {
  bookingId: string;
  onDone: () => void;
}

function InlinePaymentForm({ bookingId, onDone }: InlinePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/payment/success?bookingId=${bookingId}` },
      redirect: "if_required",
    });

    if (result.error) {
      toast.error("Payment failed", { description: result.error.message ?? "Stripe declined the payment." });
      setSubmitting(false);
      return;
    }

    toast.success("Payment confirmed", {
      description: "Stripe is confirming the payment through the webhook.",
    });
    setSubmitting(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      <Button type="submit" className="w-full" loading={submitting} disabled={!stripe || !elements}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CreditCard />
        )}
        Pay now
      </Button>
    </form>
  );
}
