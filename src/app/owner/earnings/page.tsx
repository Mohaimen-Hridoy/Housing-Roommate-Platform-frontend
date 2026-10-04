import type { Metadata } from "next";
import Link from "next/link";
import { Info, Percent, Receipt, TrendingUp, Wallet } from "lucide-react";

import { EarningsMonthlyBarChart, type ChartDatum } from "@/components/dashboard/owner/charts";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { adminApi, bookingApi } from "@/lib/api/endpoints";
import { formatCurrency, formatDate, formatMonthYear, formatNumber } from "@/lib/format";
import type { Booking, OwnerDashboard } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Earnings",
  description: "Gross earnings, platform fees, net payout and the bookings they were earned from.",
  robots: { index: false, follow: false },
};

const SAMPLE_SIZE = 100;

async function loadDashboard(): Promise<{ data: OwnerDashboard | null; error: string | null }> {
  try {
    const result = await adminApi.ownerDashboard();
    return { data: result.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unable to load your earnings summary.",
    };
  }
}

async function loadBookings(): Promise<{
  items: Booking[];
  totalItems: number;
  error: string | null;
}> {
  try {
    const result = await bookingApi.list({ sortBy: "createdAt", sortOrder: "desc", pageSize: SAMPLE_SIZE });
    return { items: result.items, totalItems: result.pagination.totalItems, error: null };
  } catch (error) {
    return {
      items: [],
      totalItems: 0,
      error: error instanceof Error ? error.message : "Unable to load your bookings.",
    };
  }
}

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

export default async function OwnerEarningsPage() {
  const [dashboard, bookings] = await Promise.all([loadDashboard(), loadBookings()]);

  const gross = dashboard.data?.earnings.gross ?? 0;
  const fees = dashboard.data?.earnings.platformFee ?? 0;
  const net = gross - fees;

  const currency = dominantCurrency(bookings.items.map((booking) => booking.currency));
  const sameCurrency = bookings.items.filter((booking) => booking.currency === currency);
  const bookedTotal = sameCurrency.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const average = sameCurrency.length > 0 ? bookedTotal / sameCurrency.length : 0;

  const monthly = new Map<string, ChartDatum>();
  for (const booking of sameCurrency) {
    const key = formatDate(booking.createdAt, "yyyy-MM");
    const existing = monthly.get(key);
    if (existing) {
      existing.value += booking.totalAmount;
    } else {
      monthly.set(key, { label: formatMonthYear(booking.createdAt), value: booking.totalAmount });
    }
  }
  const chartData = [...monthly.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);

  const truncated = bookings.totalItems > bookings.items.length;

  return (
    <>
      <PageHeader
        eyebrow="Owner dashboard"
        title="Earnings"
        description="Gross earnings come from payments that actually succeeded. The platform fee is stored on every booking, so your net payout is the difference."
        actions={
          <Button asChild variant="outline">
            <Link href="/owner/bookings">All bookings</Link>
          </Button>
        }
      />

      {dashboard.error && !dashboard.data ? (
        <ErrorState title="Earnings summary unavailable" message={dashboard.error} />
      ) : null}
      {bookings.error ? <ErrorState title="Bookings unavailable" message={bookings.error} /> : null}

      {dashboard.data ? (
        <StatCardGrid>
          <StatCard
            label="Gross earnings"
            value={formatCurrency(gross, currency)}
            icon={Wallet}
            tone="success"
            hint={`Successful payments, all time · ${currency.toUpperCase()}`}
          />
          <StatCard
            label="Platform fees"
            value={formatCurrency(fees, currency)}
            icon={Percent}
            tone="warning"
            hint="Deducted per booking by the platform"
          />
          <StatCard
            label="Net after fees"
            value={formatCurrency(net, currency)}
            icon={TrendingUp}
            tone="accent"
            hint="Gross minus platform fees"
          />
          <StatCard
            label="Average booking value"
            value={formatCurrency(average, currency)}
            icon={Receipt}
            tone="info"
            hint={`Across ${formatNumber(sameCurrency.length)} ${currency.toUpperCase()} booking${sameCurrency.length === 1 ? "" : "s"}`}
          />
        </StatCardGrid>
      ) : null}

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Booked value by month</h2>
          <p className="text-sm text-muted-foreground">
            Totals grouped from the bookings you created, restricted to {currency.toUpperCase()} so amounts are never
            added across currencies.
          </p>
        </div>
        <EarningsMonthlyBarChart data={chartData} currency={currency} />
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Bookings</h2>
          <p className="text-sm text-muted-foreground">
            {truncated
              ? `Showing the ${SAMPLE_SIZE} most recent of ${formatNumber(bookings.totalItems)} bookings.`
              : "Every booking attached to your properties."}{" "}
            Amounts are formatted with each booking&rsquo;s own currency.
          </p>
        </div>

        {!bookings.error && bookings.items.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No bookings to show"
            description="Once a tenant requests one of your rooms, its amount, fee and status appear here."
            action={{ label: "Create a listing", href: "/owner/listings/new" }}
          />
        ) : null}

        {bookings.items.length > 0 ? (
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booked</TableHead>
                  <TableHead className="hidden md:table-cell">Stay</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">Platform fee</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.items.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="text-sm">{formatDate(booking.createdAt)}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDate(booking.startDate)} → {booking.endDate ? formatDate(booking.endDate) : "open-ended"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(booking.totalAmount, booking.currency)}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
                      {formatCurrency(booking.platformFee, booking.currency)}
                    </TableCell>
                    <TableCell className="hidden text-right font-medium tabular-nums lg:table-cell">
                      {formatCurrency(booking.totalAmount - booking.platformFee, booking.currency)}
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {booking.payment ? (
                        <PaymentStatusBadge status={booking.payment.status} />
                      ) : (
                        <span className="text-xs text-muted-foreground">No payment</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {truncated ? (
          <p className="text-sm">
            <Link href="/owner/bookings" className="font-medium text-primary underline underline-offset-4">
              Browse every booking
            </Link>{" "}
            with status filters and pagination.
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-muted/20 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Info className="size-4 text-primary" aria-hidden="true" />
          How the platform fee model works
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            When a tenant requests a room, the API stores a <code className="font-mono text-xs">platformFee</code> on
            the booking alongside the total. The tenant pays the total; the platform keeps the fee.
          </li>
          <li>
            <strong>Gross earnings</strong> sums payment amounts whose status is <code className="font-mono text-xs">SUCCEEDED</code>.
            Processing, pending and failed payments are not counted.
          </li>
          <li>
            <strong>Platform fees</strong> sum the stored fee across all of your bookings, including declined and
            cancelled ones, so the figure can exceed the fee attached to settled revenue.
          </li>
          <li>
            <strong>Net</strong> is simply gross minus fees and is an estimate of your payout — this build has no payout
            provider, so no money is transferred automatically.
          </li>
        </ul>
      </section>
    </>
  );
}