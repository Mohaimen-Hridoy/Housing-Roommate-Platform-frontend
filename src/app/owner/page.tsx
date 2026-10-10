import type { Metadata } from "next";
import Link from "next/link";
import { Building2, DoorOpen, Inbox, Percent, TrendingUp, Wallet } from "lucide-react";

import {
  BookingsStatusDonutChart,
  ChartLegend,
  RoomStatusBarChart,
  type ChartDatum,
} from "@/components/dashboard/owner/charts";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader, SectionHeading } from "@/components/common/page-header";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { BookingStatusBadge, RoomStatusBadge } from "@/components/common/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { BOOKING_STATUS_META, ROOM_STATUS_META } from "@/lib/constants";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { Reveal, RevealGroup } from "@/components/brand/reveal";
import type { BookingStatus, OwnerDashboard, RoomStatus } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Overview",
  description: "Your listings, occupancy, booking pipeline and gross earnings at a glance.",
  robots: { index: false, follow: false },
};

const ROOM_STATUS_ORDER: RoomStatus[] = ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"];
const BOOKING_STATUS_ORDER: BookingStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "EXPIRED"];

async function loadDashboard(): Promise<{ data: OwnerDashboard | null; error: string | null }> {
  try {
    const result = await adminApi.ownerDashboard();
    return { data: result.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unable to load your owner dashboard.",
    };
  }
}

/** The dashboard aggregate carries amounts without a currency, so pick the most common one. */
function dominantCurrency(values: string[]): string {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best = "usd";
  let bestCount = 0;
  for (const [currency, count] of counts) {
    if (count > bestCount) {
      best = currency;
      bestCount = count;
    }
  }
  return best;
}

export default async function OwnerOverviewPage() {
  const [user, dashboard] = await Promise.all([getSessionUser(), loadDashboard()]);

  const data = dashboard.data;
  const currency = data
    ? dominantCurrency([
        ...data.recentBookings.map((booking) => booking.currency),
        ...data.topRooms.map((room) => room.currency),
      ])
    : "usd";

  const roomStatusData: ChartDatum[] = data
    ? ROOM_STATUS_ORDER.map((status) => ({
        label: ROOM_STATUS_META[status].label,
        value: data.listings.byRoomStatus[status] ?? 0,
      }))
    : [];

  const bookingStatusData: ChartDatum[] = data
    ? BOOKING_STATUS_ORDER.map((status) => ({
        label: BOOKING_STATUS_META[status].label,
        value: data.bookings.byStatus[status] ?? 0,
      }))
    : [];

  const net = data ? data.earnings.gross - data.earnings.platformFee : 0;

  return (
    <>
      <PageHeader
        eyebrow="Owner dashboard"
        title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Occupancy, booking requests and earnings for every property you own. All figures come from the live owner dashboard endpoint."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/owner/bookings">Review requests</Link>
            </Button>
            <Button asChild>
              <Link href="/owner/listings/new">Add a listing</Link>
            </Button>
          </>
        }
      />

      {dashboard.error && !data ? <ErrorState title="Dashboard unavailable" message={dashboard.error} /> : null}

      {data ? (
        <>
          <Reveal distance={18}>
            <StatCardGrid>
            <StatCard
              label="Properties"
              value={data.listings.properties}
              icon={Building2}
              href="/owner/listings"
              hint="Listings you own"
            />
            <StatCard
              label="Rooms"
              value={data.listings.rooms}
              icon={DoorOpen}
              href="/owner/listings"
              hint={`${data.listings.availableRooms} currently available`}
            />
            <StatCard
              label="Occupancy rate"
              value={formatPercent(data.listings.occupancyRate)}
              icon={Percent}
              tone="info"
              hint="Occupied rooms ÷ all rooms"
            />
            <StatCard
              label="Pending requests"
              value={data.bookings.pending}
              icon={Inbox}
              tone={data.bookings.pending > 0 ? "warning" : "default"}
              href="/owner/bookings?status=PENDING"
              hint={`${data.bookings.newInWindow} new in the last ${data.window.days} days`}
            />
            <StatCard
              label="Gross earnings"
              value={formatCurrency(data.earnings.gross, currency)}
              icon={Wallet}
              tone="success"
              href="/owner/earnings"
              hint={`All-time, successful payments · ${currency.toUpperCase()}`}
            />
            <StatCard
              label="Net after fees"
              value={formatCurrency(net, currency)}
              icon={TrendingUp}
              tone="accent"
              href="/owner/earnings"
              hint={`Platform fee ${formatCurrency(data.earnings.platformFee, currency)}`}
            />
          </StatCardGrid>
          </Reveal>

          <RevealGroup className="grid gap-6 lg:grid-cols-2" step={0.08}>
            <Reveal distance={20} as="section" className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <SectionHeading
                title="Room status"
                description="How your inventory is distributed right now."
              />
              <RoomStatusBarChart data={roomStatusData} />
            </Reveal>

            <Reveal distance={20} as="section" className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <SectionHeading title="Bookings by status" description="Every request that reached your properties." />
              <BookingsStatusDonutChart data={bookingStatusData} />
              <ChartLegend data={bookingStatusData} />
            </Reveal>
          </RevealGroup>

          <section className="space-y-4">
            <SectionHeading
              title="Recent bookings"
              description="The five most recent requests across your properties."
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link href="/owner/bookings">View all</Link>
                </Button>
              }
            />
            {data.recentBookings.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No booking requests yet"
                description="Publish a listing with an available room and tenants will start requesting it."
                action={{ label: "Create a listing", href: "/owner/listings/new" }}
              />
            ) : (
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Requested</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <p className="font-medium">{booking.tenant.name ?? "Unnamed tenant"}</p>
                          <p className="text-xs text-muted-foreground">{booking.tenant.email}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{booking.room.title}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(booking.totalAmount, booking.currency)}
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                          {formatDate(booking.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <SectionHeading title="Top performing rooms" description="Ranked by the number of bookings received." />
            {data.topRooms.length === 0 ? (
              <EmptyState
                icon={DoorOpen}
                title="No rooms to rank yet"
                description="Rooms appear here as soon as they exist on your properties."
              />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.topRooms.map((room) => (
                  <li
                    key={room.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{room.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(room.rent, room.currency)} / month · {room.bookings} booking
                        {room.bookings === 1 ? "" : "s"}
                      </p>
                    </div>
                    <RoomStatusBadge status={room.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}