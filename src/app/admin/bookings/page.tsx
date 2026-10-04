import type { Metadata } from "next";
import { Suspense } from "react";
import { BadgeCheck, CalendarCheck, CircleDollarSign, Users } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { TableSkeleton } from "@/components/common/skeletons";
import { bookingApi } from "@/lib/api/endpoints";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Paginated } from "@/lib/api/server";
import type { Booking } from "@/lib/types/api";

import { AdminErrorState } from "../admin-error-state";
import { BookingsView } from "./bookings-view";

export const metadata: Metadata = {
  title: "Bookings",
  description: "Every tenant booking on the platform, with admin approve, reject and cancel overrides.",
  robots: { index: false, follow: false, nocache: true },
};

const SORT_FIELDS = new Set(["createdAt", "startDate", "endDate", "totalAmount"]);
const SORT_ORDERS = new Set(["asc", "desc"]);
const STATUSES = new Set(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "EXPIRED"]);

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(params: SearchParams, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function readPositiveInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const statusParam = readParam(params, "status");
  const tenantId = readParam(params, "tenantId").trim();
  const propertyId = readParam(params, "propertyId").trim();
  const roomId = readParam(params, "roomId").trim();
  const from = readParam(params, "from").trim();
  const to = readParam(params, "to").trim();
  const page = readPositiveInt(readParam(params, "page"), 1);
  const pageSize = readPositiveInt(readParam(params, "pageSize"), 12);

  const rawSortBy = readParam(params, "sortBy");
  const rawSortOrder = readParam(params, "sortOrder");
  const sortBy = SORT_FIELDS.has(rawSortBy) ? rawSortBy : "createdAt";
  const sortOrder = SORT_ORDERS.has(rawSortOrder) ? rawSortOrder : "desc";

  let result: Paginated<Booking> | null = null;
  let error: string | null = null;

  try {
    result = await bookingApi.list({
      status: STATUSES.has(statusParam) ? statusParam : undefined,
      tenantId: tenantId || undefined,
      propertyId: propertyId || undefined,
      roomId: roomId || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load bookings";
  }

  if (error || !result) {
    return (
      <>
        <PageHeader
          eyebrow="Admin console"
          title="Bookings"
          description="Every booking across every tenant — admins are not scoped to a single owner."
        />
        <AdminErrorState message={error ?? "No bookings were returned by the API."} />
      </>
    );
  }

  const { items, pagination } = result;
  const currency = items[0]?.currency ?? "usd";
  const pageTotal = items.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const pageFees = items.reduce((sum, booking) => sum + booking.platformFee, 0);
  const pending = items.filter((booking) => booking.status === "PENDING").length;
  const uniqueTenants = new Set(items.map((booking) => booking.tenantId)).size;

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Bookings"
        description="Every booking across every tenant. Approve, reject and cancel are exposed here as clearly labelled admin overrides."
      />

      <StatCardGrid>
        <StatCard
          label="Bookings matched"
          value={formatNumber(pagination.totalItems)}
          icon={CalendarCheck}
          hint="Total for the current filters"
        />
        <StatCard
          label="Pending on page"
          value={formatNumber(pending)}
          icon={Users}
          tone="warning"
          hint="Waiting on a decision"
        />
        <StatCard
          label="Tenants on page"
          value={formatNumber(uniqueTenants)}
          icon={Users}
          tone="accent"
          hint={`${items.length} booking${items.length === 1 ? "" : "s"} listed`}
        />
        <StatCard
          label="Page value"
          value={formatCurrency(pageTotal, currency)}
          icon={CircleDollarSign}
          tone="success"
          hint={`${formatCurrency(pageFees, currency)} in platform fees`}
        />
      </StatCardGrid>

      <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
        <BadgeCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Approve and reject are owner actions. Using them from this console is an <strong>admin override</strong> and is
          written to the audit log with your account. The API refuses to delete an <em>approved</em> booking — cancel it
          first.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings match these filters"
          description="Try a different status, or clear the tenant, property and date filters."
          action={{ label: "Clear all filters", href: "/admin/bookings" }}
        />
      ) : (
        <Suspense fallback={<TableSkeleton rows={8} columns={8} />}>
          <BookingsView bookings={items} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <Pagination meta={pagination} />
      </Suspense>
    </>
  );
}