import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, Heart, Inbox, Wallet } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader, SectionHeading } from "@/components/common/page-header";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiListSafe } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session";
import { formatCurrency, formatDate, formatNumber, nightsBetween } from "@/lib/format";
import type { Booking, Favorite, Message } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Overview",
  description: "Your bookings, payments, favourites and messages at a glance.",
  robots: { index: false, follow: false },
};

export default async function TenantOverviewPage() {
  const session = await getSessionUser();

  // `GET /bookings/mine` is already scoped to the tenant, so it doubles as the
  // source for the payment roll-up (the platform payment list is admin-only).
  const [bookings, favourites, unread] = await Promise.all([
    apiListSafe<Booking>("/bookings/mine", {
      query: { pageSize: 100, sortBy: "createdAt", sortOrder: "desc" },
    }),
    apiListSafe<Favorite>("/favorites", { query: { pageSize: 100 } }),
    apiListSafe<Message>("/messages", { query: { folder: "inbox", read: false, pageSize: 100 } }),
  ]);

  const all = bookings.items;
  const pending = all.filter((booking) => booking.status === "PENDING").length;
  const approved = all.filter((booking) => booking.status === "APPROVED").length;

  const settled = all.filter((booking) => booking.payment?.status === "SUCCEEDED");
  const totalSpent = settled.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const spentCurrency = settled[0]?.currency ?? "usd";

  const recent = all.slice(0, 5);
  const firstName = session?.name?.split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Tenant dashboard"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Everything about your stays, payments and conversations in one place."
        actions={
          <Button asChild>
            <Link href="/properties">
              Find a room
              <ArrowRight />
            </Link>
          </Button>
        }
      />

      {bookings.error || favourites.error || unread.error ? (
        <div className="space-y-3">
          {bookings.error ? (
            <ErrorState title="Bookings unavailable" message={bookings.error} />
          ) : null}
          {favourites.error ? (
            <ErrorState title="Favourites unavailable" message={favourites.error} />
          ) : null}
          {unread.error ? <ErrorState title="Messages unavailable" message={unread.error} /> : null}
        </div>
      ) : null}

      <StatCardGrid>
        <StatCard
          label="Total bookings"
          value={formatNumber(bookings.pagination.totalItems)}
          icon={CalendarDays}
          href="/dashboard/bookings"
          hint="Every request you have sent"
        />
        <StatCard
          label="Pending"
          value={formatNumber(pending)}
          icon={CalendarDays}
          tone="warning"
          href="/dashboard/bookings?status=PENDING"
          hint="Waiting on the owner"
        />
        <StatCard
          label="Approved"
          value={formatNumber(approved)}
          icon={CalendarDays}
          tone="success"
          href="/dashboard/bookings?status=APPROVED"
          hint="Confirmed stays"
        />
        <StatCard
          label="Favourites"
          value={formatNumber(favourites.pagination.totalItems)}
          icon={Heart}
          tone="accent"
          href="/dashboard/favorites"
          hint="Saved properties"
        />
        <StatCard
          label="Total spent"
          value={formatCurrency(totalSpent, spentCurrency)}
          icon={Wallet}
          tone="success"
          href="/dashboard/payments?status=SUCCEEDED"
          hint={`${settled.length} settled payment${settled.length === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Unread messages"
          value={formatNumber(unread.pagination.totalItems)}
          icon={Inbox}
          tone="info"
          href="/dashboard/messages?folder=inbox&read=false"
          hint="Owners and tenants waiting on you"
        />
      </StatCardGrid>

      <section className="space-y-4">
        <SectionHeading
          title="Recent bookings"
          description="Your five most recent requests, newest first."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/bookings">
                View all
                <ArrowRight />
              </Link>
            </Button>
          }
        />

        {recent.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No bookings yet"
            description={
              bookings.error
                ? "We could not reach the API, so your bookings could not be loaded."
                : "Request a room from the public listings and it will show up here with live status updates."
            }
            action={{ label: "Browse rooms", href: "/properties" }}
          />
        ) : (
          <Card className="overflow-hidden border-border/80 shadow-sm">
            <CardContent className="p-0">
              <ul className="divide-y divide-border/70">
                {recent.map((booking) => {
                  const nights = booking.endDate
                    ? nightsBetween(booking.startDate, booking.endDate)
                    : 0;
                  return (
                    <li key={booking.id}>
                      <Link
                        href={`/dashboard/bookings/${booking.id}`}
                        className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-primary/[0.035] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                            {formatDate(booking.startDate, "d MMM yyyy")} →{" "}
                            {formatDate(booking.endDate, "d MMM yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {nights} night{nights === 1 ? "" : "s"} ·{" "}
                            {formatCurrency(booking.totalAmount, booking.currency)} · room{" "}
                            {booking.roomId.slice(0, 8)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <BookingStatusBadge status={booking.status} />
                          {booking.payment ? (
                            <PaymentStatusBadge status={booking.payment.status} />
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CreditCard className="size-3.5" aria-hidden="true" />
                              No payment
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}