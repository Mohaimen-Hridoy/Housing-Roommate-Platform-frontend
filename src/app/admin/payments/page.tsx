import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleDollarSign, CreditCard, Receipt, Undo2 } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { TableSkeleton } from "@/components/common/skeletons";
import { paymentApi } from "@/lib/api/endpoints";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Paginated } from "@/lib/api/server";
import type { Payment } from "@/lib/types/api";

import { AdminErrorState } from "../admin-error-state";
import { PaymentsView } from "./payments-view";

export const metadata: Metadata = {
  title: "Payments",
  description: "Admin-only payment ledger with full and partial refunds.",
  robots: { index: false, follow: false, nocache: true },
};

const SORT_FIELDS = new Set(["createdAt", "amount"]);
const SORT_ORDERS = new Set(["asc", "desc"]);
const STATUSES = new Set(["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED", "CANCELED"]);
const PROVIDERS = new Set(["STRIPE", "MOCK"]);

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

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const statusParam = readParam(params, "status");
  const providerParam = readParam(params, "provider");
  const bookingId = readParam(params, "bookingId").trim();
  const tenantId = readParam(params, "tenantId").trim();
  const from = readParam(params, "from").trim();
  const to = readParam(params, "to").trim();
  const page = readPositiveInt(readParam(params, "page"), 1);
  const pageSize = readPositiveInt(readParam(params, "pageSize"), 12);

  const rawSortBy = readParam(params, "sortBy");
  const rawSortOrder = readParam(params, "sortOrder");
  const sortBy = SORT_FIELDS.has(rawSortBy) ? rawSortBy : "createdAt";
  const sortOrder = SORT_ORDERS.has(rawSortOrder) ? rawSortOrder : "desc";

  let result: Paginated<Payment> | null = null;
  let error: string | null = null;

  try {
    result = await paymentApi.list({
      status: STATUSES.has(statusParam) ? statusParam : undefined,
      provider: PROVIDERS.has(providerParam) ? providerParam : undefined,
      bookingId: bookingId || undefined,
      tenantId: tenantId || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load payments";
  }

  if (error || !result) {
    return (
      <>
        <PageHeader
          eyebrow="Admin console"
          title="Payments"
          description="Admin-only ledger. Only a succeeded payment can be refunded."
        />
        <AdminErrorState message={error ?? "No payments were returned by the API."} />
      </>
    );
  }

  const { items, pagination } = result;
  const currency = items[0]?.currency ?? "usd";
  const pageTotal = items.reduce((sum, payment) => sum + payment.amount, 0);
  const succeeded = items.filter((payment) => payment.status === "SUCCEEDED");
  const succeededTotal = succeeded.reduce((sum, payment) => sum + payment.amount, 0);
  const refunded = items.filter(
    (payment) => payment.status === "REFUNDED" || payment.status === "PARTIALLY_REFUNDED",
  ).length;
  const stripeCount = items.filter((payment) => payment.provider === "STRIPE").length;

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Payments"
        description="Admin-only ledger across Stripe and the mock provider. `GET /payments` is restricted to admins, which is why this page exists."
      />

      <StatCardGrid>
        <StatCard
          label="Payments matched"
          value={formatNumber(pagination.totalItems)}
          icon={Receipt}
          hint="Total for the current filters"
        />
        <StatCard
          label="Page value"
          value={formatCurrency(pageTotal, currency)}
          icon={CircleDollarSign}
          tone="success"
          hint={`${items.length} payment${items.length === 1 ? "" : "s"} on this page`}
        />
        <StatCard
          label="Settled on page"
          value={formatCurrency(succeededTotal, currency)}
          icon={CreditCard}
          tone="accent"
          hint={`${succeeded.length} succeeded · ${refunded} refunded`}
        />
        <StatCard
          label="Stripe share"
          value={formatNumber(stripeCount)}
          icon={Undo2}
          tone="info"
          hint={`${items.length - stripeCount} on the mock provider`}
        />
      </StatCardGrid>

      {items.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments match these filters"
          description="Adjust the status or provider filter, or clear the booking and tenant filters."
          action={{ label: "Clear all filters", href: "/admin/payments" }}
        />
      ) : (
        <Suspense fallback={<TableSkeleton rows={8} columns={7} />}>
          <PaymentsView payments={items} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <Pagination meta={pagination} />
      </Suspense>
    </>
  );
}