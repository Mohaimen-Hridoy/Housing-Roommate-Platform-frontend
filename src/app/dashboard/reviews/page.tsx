import type { Metadata } from "next";

import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { PageHeader } from "@/components/common/page-header";
import { ActiveFilterChips, FilterSelect } from "@/components/common/url-state";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { Star } from "lucide-react";
import { apiDataSafe, apiListSafe } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session";
import { formatNumber } from "@/lib/format";
import type { PaginationMeta, PropertyDetail, Review, Room } from "@/lib/types/api";

import { ReviewList, type TenantReviewRow } from "@/components/dashboard/tenant/review-list";

export const metadata: Metadata = {
  title: "Reviews",
  description: "The ratings and comments you have written about rooms and properties.",
  robots: { index: false, follow: false },
};

const RATING_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({
  value: String(value),
  label: `${value} star${value === 1 ? "" : "s"}`,
}));

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toRating(value: string | undefined): number | null {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
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

export default async function TenantReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();

  const minRating = toRating(one(params.minRating));
  const maxRating = toRating(one(params.maxRating));
  const page = Math.max(1, Number.parseInt(one(params.page) ?? "1", 10) || 1);
  const pageSize = Math.max(1, Number.parseInt(one(params.pageSize) ?? "12", 10) || 12);

  if (!session) {
    return <ErrorState title="Not signed in" message="Sign in as a tenant to see your reviews." />;
  }

  // `GET /reviews?authorId=` is public, so the tenant's own reviews resolve
  // without admin-only user lookups.
  const result = await apiListSafe<Review>("/reviews", {
    query: { authorId: session.id, pageSize: 100, sortBy: "createdAt", sortOrder: "desc" },
  });

  const mine = result.items.filter((review) => review.authorId === session.id);

  const filtered = mine.filter((review) => {
    if (minRating !== null && review.rating < minRating) return false;
    if (maxRating !== null && review.rating > maxRating) return false;
    return true;
  });

  const start = (page - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const meta = buildMeta(page, pageSize, filtered.length);

  // Resolve what each review refers to, in parallel and tolerant of failures.
  const roomIds = [...new Set(visible.filter((r) => r.subject === "ROOM").map((r) => r.reviewableId))];
  const propertyIds = [
    ...new Set(visible.filter((r) => r.subject === "PROPERTY").map((r) => r.reviewableId)),
  ];

  const [rooms, properties] = await Promise.all([
    Promise.all(roomIds.map(async (id) => [id, await apiDataSafe<Room>(`/rooms/${id}`)] as const)),
    Promise.all(
      propertyIds.map(async (id) => [id, await apiDataSafe<PropertyDetail>(`/properties/${id}`)] as const),
    ),
  ]);

  const roomById = new Map(rooms.map(([id, lookup]) => [id, lookup.data]));
  const propertyById = new Map(properties.map(([id, lookup]) => [id, lookup.data]));

  const rows: TenantReviewRow[] = visible.map((review) => {
    if (review.subject === "ROOM") {
      const room = roomById.get(review.reviewableId);
      return {
        review,
        targetLabel: room ? room.title : `Room ${review.reviewableId.slice(0, 8)}`,
        targetHref: room?.property ? `/properties/${room.property.id}` : null,
      };
    }
    const property = propertyById.get(review.reviewableId);
    return {
      review,
      targetLabel: property ? property.title : `Property ${review.reviewableId.slice(0, 8)}`,
      targetHref: property ? `/properties/${property.id}` : null,
    };
  });

  const average =
    mine.length > 0 ? mine.reduce((sum, review) => sum + review.rating, 0) / mine.length : 0;
  const roomCount = mine.filter((review) => review.subject === "ROOM").length;

  return (
    <>
      <PageHeader
        eyebrow="Tenant dashboard"
        title="My reviews"
        description="Ratings and comments you wrote about rooms and properties after an approved stay."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Reviews" }]}
      />

      {result.error ? (
        <ErrorState title="Reviews could not be loaded" message={result.error} />
      ) : (
        <>
          <StatCardGrid>
            <StatCard label="Reviews written" value={formatNumber(mine.length)} icon={Star} tone="accent" />
            <StatCard
              label="Average rating"
              value={mine.length > 0 ? average.toFixed(1) : "—"}
              icon={Star}
              tone="warning"
              hint="Across every review you wrote"
            />
            <StatCard label="Room reviews" value={formatNumber(roomCount)} icon={Star} />
            <StatCard
              label="Property reviews"
              value={formatNumber(mine.length - roomCount)}
              icon={Star}
              tone="info"
            />
          </StatCardGrid>

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect paramKey="minRating" label="Minimum rating" allLabel="Any rating" options={RATING_OPTIONS} />
            <FilterSelect paramKey="maxRating" label="Maximum rating" allLabel="Any rating" options={RATING_OPTIONS} />
          </div>

          <ActiveFilterChips labels={{ minRating: "Min rating", maxRating: "Max rating" }} />

          <ReviewList initialRows={rows} />
          <Pagination meta={meta} />
        </>
      )}
    </>
  );
}