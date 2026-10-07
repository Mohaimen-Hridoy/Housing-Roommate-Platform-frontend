import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock, CreditCard, Heart, Inbox, Wallet } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader, SectionHeading } from "@/components/common/page-header";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tenant dashboard"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Everything about your stays, payments and conversations in one unified place."
        actions={
          <Button asChild size="sm" className="shadow-xs font-medium">
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

      {/* Primary KPI Metrics Strip */}
      <StatCardGrid>
        <StatCard
          label="Total spent"
          value={formatCurrency(totalSpent, spentCurrency)}
          icon={Wallet}
          tone="success"
          href="/dashboard/payments?status=SUCCEEDED"
          hint={`${settled.length} settled payment${settled.length === 1 ? "" : "s"}`}
          trend={{ value: "Stripe Escrow", positive: true }}
        />
        <StatCard
          label="Confirmed stays"
          value={formatNumber(approved)}
          icon={CheckCircle2}
          tone="success"
          href="/dashboard/bookings?status=APPROVED"
          hint="Approved bookings"
          trend={{ value: "Active", positive: true }}
        />
        <StatCard
          label="Pending requests"
          value={formatNumber(pending)}
          icon={Clock}
          tone="warning"
          href="/dashboard/bookings?status=PENDING"
          hint="Awaiting owner review"
        />
        <StatCard
          label="Unread messages"
          value={formatNumber(unread.pagination.totalItems)}
          icon={Inbox}
          tone="info"
          href="/dashboard/messages?folder=inbox&read=false"
          hint="Inbox conversations"
        />
      </StatCardGrid>

      {/* Secondary Quick Summary Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-card/60 px-5 py-3 text-xs text-muted-foreground backdrop-blur-xs">
        <div className="flex items-center gap-6">
          <Link href="/dashboard/bookings" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <CalendarDays className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">{bookings.pagination.totalItems}</span> Lifetime bookings
          </Link>
          <span className="text-border">|</span>
          <Link href="/dashboard/favorites" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Heart className="size-3.5 text-rose-500" />
            <span className="font-semibold text-foreground">{favourites.pagination.totalItems}</span> Saved favourites
          </Link>
        </div>

        <Link href="/properties" className="font-medium text-primary hover:underline">
          Browse new listings →
        </Link>
      </div>

      {/* Clean, De-cluttered Recent Bookings */}
      <section className="space-y-4">
        <SectionHeading
          title="Recent stays & requests"
          description="Your latest booking activities with real-time status and payment updates."
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
          <Card className="surface-raised edge-light overflow-hidden shadow-xs">
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
                        className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <span className="mt-0.5 sm:mt-0 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <CalendarDays className="size-4" />
                          </span>

                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                              {formatDate(booking.startDate, "d MMM yyyy")} →{" "}
                              {formatDate(booking.endDate, "d MMM yyyy")}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                                {nights} night{nights === 1 ? "" : "s"}
                              </Badge>
                              <span>·</span>
                              <span className="font-semibold text-foreground">
                                {formatCurrency(booking.totalAmount, booking.currency)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 sm:ml-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <BookingStatusBadge status={booking.status} />
                            {booking.payment ? (
                              <PaymentStatusBadge status={booking.payment.status} />
                            ) : (
                              <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                <CreditCard className="size-3" aria-hidden="true" />
                                Unpaid
                              </span>
                            )}
                          </div>

                          <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
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
    </div>
  );
}