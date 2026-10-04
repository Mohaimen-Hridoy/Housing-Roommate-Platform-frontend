import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  DoorOpen,
  Info,
  MapPin,
  MessageSquare,
  Star,
  Wallet,
  XCircle,
} from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { RatingStars } from "@/components/common/rating";
import { RoomStatusBadge, PropertyStatusBadge, BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CancelBookingButton } from "@/components/dashboard/tenant/cancel-booking-button";
import { CheckoutButton } from "@/components/payment/checkout-button";
import { ComposeMessageDialog } from "@/components/dashboard/tenant/compose-message-dialog";
import { ReviewForm, type ReviewTarget } from "@/components/dashboard/tenant/review-form";
import { bookingApi } from "@/lib/api/endpoints";
import { ApiRequestError, apiDataSafe, apiListSafe } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session";
import { FACING_META } from "@/lib/constants";
import { formatArea, formatCurrency, formatDate, formatDateTime, nightsBetween } from "@/lib/format";
import type { Booking, Payment, PropertyDetail, Review, Room } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Booking details",
  description: "Timeline, amount breakdown and payment record for one of your bookings.",
  robots: { index: false, follow: false },
};

type StepState = "done" | "current" | "todo" | "failed";

interface TimelineStep {
  key: string;
  title: string;
  description: string;
  at: string | null;
  state: StepState;
}

export default async function TenantBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionUser();

  let booking: Booking;
  try {
    booking = await bookingApi.detail(id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    return (
      <ErrorState
        title="This booking could not be loaded"
        message={error instanceof Error ? error.message : "The API request failed."}
      />
    );
  }

  const [room, property, payments, reviews] = await Promise.all([
    apiDataSafe<Room>(`/rooms/${booking.roomId}`),
    apiDataSafe<PropertyDetail>(`/properties/${booking.propertyId}`),
    apiDataSafe<Payment[]>(`/bookings/${booking.id}/payments`),
    apiListSafe<Review>("/reviews", { query: { bookingId: booking.id, pageSize: 100 } }),
  ]);

  const paymentRows = payments.data ?? [];
  const latestPayment = paymentRows[0] ?? null;
  const paymentStatus = latestPayment?.status ?? booking.payment?.status ?? null;
  const nights = booking.endDate ? nightsBetween(booking.startDate, booking.endDate) : 0;
  const subtotal = booking.nightlyRate * nights;

  // The reviews endpoint is public; filter defensively because the list may
  // include reviews for other bookings.
  const bookingReviews = reviews.items.filter((review) => review.bookingId === booking.id);
  const myReviews = bookingReviews.filter((review) => review.authorId === session?.id);

  const reviewTargets: ReviewTarget[] = [];
  if (booking.status === "APPROVED") {
    if (!myReviews.some((review) => review.subject === "ROOM" && review.reviewableId === booking.roomId)) {
      reviewTargets.push({
        subject: "ROOM",
        reviewableId: booking.roomId,
        label: room.data ? `Room: ${room.data.title}` : `Room ${booking.roomId.slice(0, 8)}`,
      });
    }
    if (!myReviews.some((review) => review.subject === "PROPERTY" && review.reviewableId === booking.propertyId)) {
      reviewTargets.push({
        subject: "PROPERTY",
        reviewableId: booking.propertyId,
        label: property.data ? `Property: ${property.data.title}` : `Property ${booking.propertyId.slice(0, 8)}`,
      });
    }
  }

  const steps = buildTimeline(booking, latestPayment, myReviews.length > 0);
  const canCancel = booking.status === "PENDING" || booking.status === "APPROVED";
  const needsPayment = booking.status === "APPROVED" && paymentStatus !== "SUCCEEDED";

  return (
    <>
      <Link
        href="/dashboard/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to my bookings
      </Link>

      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Booking {booking.id.slice(0, 8)}</Badge>
            <BookingStatusBadge status={booking.status} />
            {paymentStatus ? <PaymentStatusBadge status={paymentStatus} /> : null}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {room.data?.title ?? "Room details"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {property.data?.title ?? `Property ${booking.propertyId.slice(0, 8)}`}
            {property.data ? ` · ${property.data.city}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(booking.startDate, "d MMM yyyy")} → {formatDate(booking.endDate, "d MMM yyyy")} ·{" "}
            {nights} night{nights === 1 ? "" : "s"} · requested {formatDate(booking.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {needsPayment ? <CheckoutButton booking={booking} payments={paymentRows} /> : null}
          {canCancel ? <CancelBookingButton bookingId={booking.id} /> : null}
          {property.data ? (
            <ComposeMessageDialog
              defaultRecipientId={property.data.ownerId}
              defaultPropertyId={property.data.id}
              triggerLabel="Message owner"
            />
          ) : null}
        </div>
      </header>

      {room.error || property.error ? (
        <ErrorState
          title="Listing context unavailable"
          message={room.error ?? property.error ?? "The room or property record could not be loaded."}
        />
      ) : null}

      {needsPayment ? (
        <Alert>
          <CreditCard className="size-4" aria-hidden="true" />
          <AlertTitle>Payment due</AlertTitle>
          <AlertDescription>
            {`This booking is approved but the payment is ${
              paymentStatus ? paymentStatus.toLowerCase() : "not settled"
            }. Use "Pay now" to open a Stripe Checkout Session.`}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleDashed className="size-4" aria-hidden="true" />
                Booking timeline
              </CardTitle>
              <CardDescription>Requested → decision → payment → review.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {steps.map((step) => (
                  <li key={step.key} className="flex gap-3">
                    <span className="mt-0.5">
                      {step.state === "done" ? (
                        <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
                      ) : step.state === "failed" ? (
                        <XCircle className="size-5 text-destructive" aria-hidden="true" />
                      ) : step.state === "current" ? (
                        <CreditCard className="size-5 text-primary" aria-hidden="true" />
                      ) : (
                        <CircleDashed className="size-5 text-muted-foreground/60" aria-hidden="true" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.at ? (
                        <p className="text-xs text-muted-foreground">{formatDateTime(step.at)}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-4" aria-hidden="true" />
                Amount breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <Row label="Nightly rate" value={formatCurrency(booking.nightlyRate, booking.currency)} />
                <Row label="Nights" value={String(nights)} />
                <Row label="Subtotal" value={formatCurrency(subtotal, booking.currency)} />
                <Row label="Platform fee" value={formatCurrency(booking.platformFee, booking.currency)} />
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <dt className="font-medium">Total</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4" aria-hidden="true" />
                Payment record
              </CardTitle>
              <CardDescription>
                Sourced from the booking payment endpoint, which is scoped to booking participants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.error ? (
                <ErrorState title="Payments unavailable" message={payments.error} />
              ) : paymentRows.length === 0 ? (
                <EmptyState
                  compact
                  icon={CreditCard}
                  title="No payment recorded yet"
                  description="A pending payment is created as soon as the booking request is sent."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRows.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium tabular-nums">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.provider}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {payment.providerPaymentId ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {booking.status === "APPROVED" ? (
            reviewTargets.length > 0 ? (
              <ReviewForm bookingId={booking.id} targets={reviewTargets} />
            ) : (
              <EmptyState
                icon={Star}
                title="You have reviewed this stay"
                description="You can review both the room and the property once, and you have used both."
              />
            )
          ) : null}

          {myReviews.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="size-4" aria-hidden="true" />
                  Your reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {myReviews.map((review) => (
                  <div key={review.id} className="space-y-1 border-l-2 border-primary/30 pl-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={review.subject === "ROOM" ? "info" : "secondary"}>
                        {review.subject === "ROOM" ? "Room" : "Property"}
                      </Badge>
                      <RatingStars rating={review.rating} size="sm" />
                      <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.comment ? <p className="text-sm text-muted-foreground">{review.comment}</p> : null}
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <Link href="/dashboard/reviews">Manage all reviews</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          {room.data ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="size-4" aria-hidden="true" />
                  Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RoomStatusBadge status={room.data.status} />
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Title" value={room.data.title} />
                  <Row label="Rent" value={`${formatCurrency(room.data.rent, room.data.currency)} / month`} />
                  <Row label="Deposit" value={formatCurrency(room.data.deposit, room.data.currency)} />
                  <Row label="Area" value={formatArea(room.data.area)} />
                  <Row
                    label="Bedrooms"
                    value={room.data.bedrooms === null ? "—" : String(room.data.bedrooms)}
                  />
                  <Row
                    label="Bathrooms"
                    value={room.data.bathrooms === null ? "—" : String(room.data.bathrooms)}
                  />
                  <Row
                    label="Facing"
                    value={room.data.facing ? (FACING_META[room.data.facing]?.label ?? room.data.facing) : "—"}
                  />
                  <Row label="Available from" value={formatDate(room.data.availableFrom)} />
                </dl>
              </CardContent>
            </Card>
          ) : null}

          {property.data ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-4" aria-hidden="true" />
                  Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <PropertyStatusBadge status={property.data.status} />
                  <Badge variant="outline">
                    <MapPin className="size-3" aria-hidden="true" />
                    {property.data.city}
                  </Badge>
                </div>
                <dl className="space-y-2 text-sm">
                  <Row label="Title" value={property.data.title} />
                  <Row label="Address" value={property.data.address} />
                  <Row
                    label="Owner id"
                    value={<span className="font-mono text-xs">{property.data.ownerId}</span>}
                  />
                </dl>

                {property.data.amenities.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {property.data.amenities.map((amenity) => (
                        <Badge key={amenity.id} variant="secondary">
                          {amenity.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/properties/${property.data.id}`}>
                    <CalendarDays className="size-4" aria-hidden="true" />
                    View listing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="size-4" aria-hidden="true" />
                Need help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                {property.data
                  ? "Message the property owner about this booking using the owner id above."
                  : "Once the property record loads you can message the owner directly."}
              </p>
              {property.data ? (
                <ComposeMessageDialog
                  defaultRecipientId={property.data.ownerId}
                  defaultPropertyId={property.data.id}
                />
              ) : null}
              <p className="flex items-start gap-1.5 text-xs">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                The API never exposes other user records to tenants, so conversations are labelled by
                participant id rather than by name.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function buildTimeline(booking: Booking, payment: Payment | null, reviewed: boolean): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      key: "requested",
      title: "Request sent",
      description: `You requested ${roomLabel(booking)}. The room was reserved while the owner reviewed it.`,
      at: booking.createdAt,
      state: "done",
    },
  ];

  const decision: TimelineStep =
    booking.status === "APPROVED"
      ? {
          key: "decision",
          title: "Approved by the owner",
          description: "The room is now occupied and the payment is ready to settle.",
          at: null,
          state: "done",
        }
      : booking.status === "REJECTED"
        ? {
            key: "decision",
            title: "Rejected by the owner",
            description: "The owner declined the request and the room was released.",
            at: null,
            state: "failed",
          }
        : booking.status === "CANCELLED"
          ? {
              key: "decision",
              title: "Cancelled",
              description: "The booking was cancelled and the room returned to available.",
              at: null,
              state: "failed",
            }
          : booking.status === "EXPIRED"
            ? {
                key: "decision",
                title: "Expired",
                description: "The request expired before the owner decided.",
                at: null,
                state: "failed",
              }
            : {
                key: "decision",
                title: "Waiting for the owner",
                description: "The owner has not approved or rejected this request yet.",
                at: null,
                state: "current",
              };

  steps.push(decision);

  const paymentState: StepState =
    booking.status === "PENDING" || booking.status === "REJECTED" || booking.status === "EXPIRED"
      ? "todo"
      : payment === null
        ? "todo"
        : payment.status === "SUCCEEDED"
          ? "done"
          : payment.status === "FAILED" || payment.status === "CANCELED"
            ? "failed"
            : booking.status === "APPROVED"
              ? "current"
              : "todo";

  steps.push({
    key: "payment",
    title: payment ? `Payment ${payment.status.toLowerCase()}` : "Payment",
    description:
      paymentState === "todo"
        ? "A pending payment exists and settles once the booking is approved."
        : payment
          ? `${formatCurrency(payment.amount, payment.currency)} via ${payment.provider}.`
          : "No payment record was returned for this booking.",
    at: payment?.updatedAt ?? null,
    state: paymentState,
  });

  steps.push({
    key: "review",
    title: reviewed ? "Reviewed" : "Review",
    description: reviewed
      ? "You left a review for this stay."
      : booking.status === "APPROVED"
        ? "You can rate the room and the property."
        : "Reviews unlock once the booking is approved.",
    at: null,
    state: reviewed ? "done" : booking.status === "APPROVED" ? "current" : "todo",
  });

  return steps;
}

function roomLabel(booking: Booking): string {
  return `room ${booking.roomId.slice(0, 8)}`;
}