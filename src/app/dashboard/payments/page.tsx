import type { Metadata } from "next";
import Link from "next/link";
import { CircleDollarSign, Info, Receipt } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { ActiveFilterChips, FilterSelect, SortSelect } from "@/components/common/url-state";
import { PaymentStatusBadge } from "@/components/common/status-badge";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiDataSafe, apiListSafe } from "@/lib/api/server";
import { PAYMENT_STATUS_META } from "@/lib/constants";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { Booking, PaginationMeta, Payment, PaymentStatus } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Payments",
  description: "Every payment recorded against your bookings, with totals and provider details.",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = (Object.keys(PAYMENT_STATUS_META) as PaymentStatus[]).map((status) => ({
  value: status,
  label: PAYMENT_STATUS_META[status].label,
}));

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "amount:desc", label: "Highest amount" },
  { value: "amount:asc", label: "Lowest amount" },
];

/** Booking-scoped lookups are bounded so a long history cannot fan out. */
const MAX_BOOKINGS = 100;

interface TenantPaymentRow {
  payment: Payment;
  booking: Booking;
}

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildMeta(page: number, pageSize: number, totalItems: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export default async function TenantPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const status = one(params.status) as PaymentStatus | undefined;
  const sortBy = one(params.sortBy) ?? "createdAt";
  const sortOrder = one(params.sortOrder) ?? "desc";
  const page = toPositiveInt(one(params.page), 1);
  const pageSize = toPositiveInt(one(params.pageSize), 12);

  // `GET /payments` is admin-scoped, so the tenant payment view is assembled
  // from their own bookings plus the participant payment endpoint.
  const bookings = await apiListSafe<Booking>("/bookings/mine", {
    query: { pageSize: MAX_BOOKINGS, sortBy: "createdAt", sortOrder: "desc" },
  });

  const lookup = await Promise.all(
    bookings.items
      .slice(0, MAX_BOOKINGS)
      .map(async (booking) => [booking, await apiDataSafe<Payment[]>(`/bookings/${booking.id}/payments`)] as const),
  );

  const partialWarnings = lookup
    .filter(([, result]) => result.error !== null)
    .map(([booking, result]) => `${booking.id.slice(0, 8)}: ${result.error}`);

  const rows: TenantPaymentRow[] = lookup
    .flatMap(([booking, result]) =>
      (result.data ?? []).map((payment) => ({ payment, booking })),
    )
    .sort((a, b) => {
      const delta = new Date(b.payment.createdAt).getTime() - new Date(a.payment.createdAt).getTime();
      return delta;
    });

  const paid = rows.filter((row) => row.payment.status === "SUCCEEDED");
  const refunded = rows.filter(
    (row) => row.payment.status === "REFUNDED" || row.payment.status === "PARTIALLY_REFUNDED",
  );
  const outstanding = rows.filter(
    (row) => row.payment.status === "PENDING" || row.payment.status === "PROCESSING",
  );

  const sum = (entries: TenantPaymentRow[]) => entries.reduce((total, row) => total + row.payment.amount, 0);
  const currency = rows[0]?.payment.currency ?? paid[0]?.payment.currency ?? "usd";

  const filtered = status ? rows.filter((row) => row.payment.status === status) : rows;
  const sorted = sortBy === "amount"
    ? [...filtered].sort((a, b) =>
        sortOrder === "asc" ? a.payment.amount - b.payment.amount : b.payment.amount - a.payment.amount,
      )
    : [...filtered].sort((a, b) => {
        const delta = new Date(a.payment.createdAt).getTime() - new Date(b.payment.createdAt).getTime();
        return sortOrder === "asc" ? -delta : delta;
      });

  const start = (page - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);
  const meta = buildMeta(page, pageSize, sorted.length);

  return (
    <>
      <PageHeader
        eyebrow="Tenant dashboard"
        title="Payments"
        description="Amounts charged against your bookings, straight from the booking payment records."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Payments" }]}
      />

      <Alert>
        <Info className="size-4" aria-hidden="true" />
        <AlertTitle>Why this list is built from your bookings</AlertTitle>
        <AlertDescription>
          The platform-wide payment list (<code className="font-mono text-xs">GET /payments</code>) is restricted to
          administrators, so this page resolves <code className="font-mono text-xs">GET /bookings/:id/payments</code>{" "}
          for each of your bookings instead. Only your own payments appear.
        </AlertDescription>
      </Alert>

      {bookings.error ? (
        <ErrorState title="Payments could not be loaded" message={bookings.error} />
      ) : (
        <>
          <StatCardGrid>
            <StatCard
              label="Total paid"
              value={formatCurrency(sum(paid), currency)}
              icon={CircleDollarSign}
              tone="success"
              hint={`${formatNumber(paid.length)} settled payment${paid.length === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Outstanding"
              value={formatCurrency(sum(outstanding), currency)}
              icon={Receipt}
              tone="warning"
              hint="Pending or processing"
            />
            <StatCard
              label="Refunded"
              value={formatCurrency(sum(refunded), currency)}
              icon={Receipt}
              tone="default"
              hint={`${formatNumber(refunded.length)} refund${refunded.length === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Payment records"
              value={formatNumber(rows.length)}
              icon={Receipt}
              hint={`Across ${formatNumber(bookings.pagination.totalItems)} bookings`}
            />
          </StatCardGrid>

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              paramKey="status"
              label="Payment status"
              allLabel="All statuses"
              options={STATUS_OPTIONS}
            />
            <SortSelect options={SORT_OPTIONS} label="Sort payments" />
          </div>

          <ActiveFilterChips labels={{ status: "Status", sortBy: "Sort by", sortOrder: "Order" }} />

          {partialWarnings.length > 0 ? (
            <ErrorState
              title="Some payment records could not be loaded"
              message={`${partialWarnings.length} booking(s) failed: ${partialWarnings.slice(0, 3).join(" · ")}`}
            />
          ) : null}

          {sorted.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={
                status
                  ? `No payments with status ${PAYMENT_STATUS_META[status].label.toLowerCase()}`
                  : "No payments recorded yet"
              }
              description="A payment is created automatically as soon as you request a booking, so approved stays always show up here."
              action={{ label: "View my bookings", href: "/dashboard/bookings" }}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Booking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((row) => (
                      <TableRow key={row.payment.id}>
                        <TableCell className="font-medium tabular-nums">
                          {formatCurrency(row.payment.amount, row.payment.currency)}
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={row.payment.status} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.payment.provider}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(row.payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/bookings/${row.booking.id}`}
                            className="font-mono text-xs text-primary underline-offset-2 hover:underline"
                          >
                            {row.booking.id.slice(0, 8)}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Pagination meta={meta} />
        </>
      )}
    </>
  );
}