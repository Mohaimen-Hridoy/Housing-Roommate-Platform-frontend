import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, CheckCircle2, LayoutList, MapPin } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { TableSkeleton } from "@/components/common/skeletons";
import { propertyApi } from "@/lib/api/endpoints";
import { PROPERTY_STATUS_META } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import type { Paginated } from "@/lib/api/server";
import type { PropertyListItem } from "@/lib/types/api";

import { AdminErrorState } from "../admin-error-state";
import { PropertiesView } from "./properties-view";

export const metadata: Metadata = {
  title: "Properties",
  description: "Moderate every listing: publish, archive or remove properties and their rooms.",
  robots: { index: false, follow: false, nocache: true },
};

const SORT_FIELDS = new Set(["createdAt", "title", "publishedAt", "city"]);
const SORT_ORDERS = new Set(["asc", "desc"]);
const STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);

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

export default async function AdminPropertiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const statusParam = readParam(params, "status");
  const search = readParam(params, "search").trim();
  const city = readParam(params, "city").trim();
  const ownerId = readParam(params, "ownerId").trim();
  const page = readPositiveInt(readParam(params, "page"), 1);
  const pageSize = readPositiveInt(readParam(params, "pageSize"), 12);

  const rawSortBy = readParam(params, "sortBy");
  const rawSortOrder = readParam(params, "sortOrder");
  const sortBy = SORT_FIELDS.has(rawSortBy) ? rawSortBy : "createdAt";
  const sortOrder = SORT_ORDERS.has(rawSortOrder) ? rawSortOrder : "desc";

  let result: Paginated<PropertyListItem> | null = null;
  let error: string | null = null;

  try {
    result = await propertyApi.adminList({
      status: STATUSES.has(statusParam) ? statusParam : undefined,
      search: search || undefined,
      city: city || undefined,
      ownerId: ownerId || undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load properties";
  }

  if (error || !result) {
    return (
      <>
        <PageHeader eyebrow="Admin console" title="Properties" description="Every listing on the platform." />
        <AdminErrorState message={error ?? "No properties were returned by the API."} />
      </>
    );
  }

  const { items, pagination } = result;
  const published = items.filter((item) => item.status === "PUBLISHED").length;
  const cities = new Set(items.map((item) => item.city)).size;

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Properties"
        description="Moderate the whole inventory. Publication state here controls visibility in public search."
      />

      <StatCardGrid>
        <StatCard
          label="Listings matched"
          value={formatNumber(pagination.totalItems)}
          icon={LayoutList}
          hint="Total for the current filters"
        />
        <StatCard
          label="Published on page"
          value={formatNumber(published)}
          icon={CheckCircle2}
          tone="success"
          hint={`${items.length} listing${items.length === 1 ? "" : "s"} on this page`}
        />
        <StatCard label="Distinct cities" value={formatNumber(cities)} icon={MapPin} tone="info" hint="On the current page" />
        <StatCard
          label="Status filter"
          value={STATUSES.has(statusParam) ? PROPERTY_STATUS_META[statusParam as "DRAFT"].label : "All"}
          icon={Building2}
          tone="accent"
          hint="Change it from the filter above"
        />
      </StatCardGrid>

      {items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties match these filters"
          description="Try clearing the status, city or owner filter, or widen the free-text search."
          action={{ label: "Clear all filters", href: "/admin/properties" }}
        />
      ) : (
        <Suspense fallback={<TableSkeleton rows={8} columns={7} />}>
          <PropertiesView properties={items} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <Pagination meta={pagination} />
      </Suspense>
    </>
  );
}