import type { Metadata } from "next";
import { Suspense } from "react";
import { Hash, Layers, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { TableSkeleton } from "@/components/common/skeletons";
import { apiList } from "@/lib/api/server";
import { formatNumber } from "@/lib/format";
import type { Paginated } from "@/lib/api/server";
import type { Amenity } from "@/lib/types/api";

import { AdminErrorState } from "../admin-error-state";
import { AmenitiesView } from "./amenities-view";

export const metadata: Metadata = {
  title: "Amenities",
  description: "Maintain the shared amenity vocabulary referenced by every property listing.",
  robots: { index: false, follow: false, nocache: true },
};

const SORT_FIELDS = new Set(["createdAt", "name"]);
const SORT_ORDERS = new Set(["asc", "desc"]);

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

export default async function AdminAmenitiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const search = readParam(params, "search").trim();
  const page = readPositiveInt(readParam(params, "page"), 1);
  const pageSize = readPositiveInt(readParam(params, "pageSize"), 12);

  const rawSortBy = readParam(params, "sortBy");
  const rawSortOrder = readParam(params, "sortOrder");
  const sortBy = SORT_FIELDS.has(rawSortBy) ? rawSortBy : "name";
  const sortOrder = SORT_ORDERS.has(rawSortOrder) ? rawSortOrder : "asc";

  let result: Paginated<Amenity> | null = null;
  let error: string | null = null;

  try {
    // `amenityApi.list` hard-codes pageSize/sort, so the URL-driven pagination
    // and sorting are applied here instead. `revalidate: false` keeps the read
    // out of the Next data cache so a mutation is visible on the next refresh.
    result = await apiList<Amenity>("/amenities", {
      query: { search: search || undefined, page, pageSize, sortBy, sortOrder },
      anonymous: true,
      revalidate: false,
    });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load amenities";
  }

  if (error || !result) {
    return (
      <>
        <PageHeader
          eyebrow="Admin console"
          title="Amenities"
          description="The shared amenity vocabulary every listing references."
        />
        <AdminErrorState message={error ?? "No amenities were returned by the API."} />
      </>
    );
  }

  const { items, pagination } = result;
  const withIcon = items.filter((amenity) => amenity.icon).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Amenities"
        description="The shared amenity vocabulary every listing references. Names must stay unique."
      />

      <StatCardGrid>
        <StatCard
          label="Amenities matched"
          value={formatNumber(pagination.totalItems)}
          icon={Layers}
          hint="Total for the current search"
        />
        <StatCard
          label="On this page"
          value={formatNumber(items.length)}
          icon={Sparkles}
          tone="accent"
          hint="Sorted by name, ascending"
        />
        <StatCard
          label="With an icon key"
          value={formatNumber(withIcon)}
          icon={Hash}
          tone="info"
          hint="Used by the public amenity filters"
        />
        <StatCard
          label="Unique names"
          value={formatNumber(pagination.totalItems)}
          icon={Layers}
          tone="success"
          hint="The API rejects duplicates with 409"
        />
      </StatCardGrid>

      <Suspense fallback={<TableSkeleton rows={8} columns={4} />}>
        <AmenitiesView amenities={items} />
      </Suspense>

      <Suspense fallback={null}>
        <Pagination meta={pagination} />
      </Suspense>
    </>
  );
}