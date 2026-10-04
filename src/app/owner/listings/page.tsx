import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

import { ListingActions } from "@/components/dashboard/owner/listing-actions";
import { OwnerFilterBar } from "@/components/dashboard/owner/owner-filter-bar";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { PropertyStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { propertyApi } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { PROPERTY_STATUS_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { PaginationMeta, PropertyListItem, PropertyStatus } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Listings",
  description: "Every property you own — publish, unpublish, edit or archive your listings.",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

const PROPERTY_STATUSES: PropertyStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const SORT_FIELDS = ["createdAt", "title", "publishedAt", "city"] as const;

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: 12,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

interface ListingsQuery {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

async function loadListings(
  ownerId: string,
  query: ListingsQuery,
): Promise<{ items: PropertyListItem[]; pagination: PaginationMeta; error: string | null }> {
  try {
    const result = await propertyApi.ownerList(ownerId, {
      status: query.status,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      pageSize: query.pageSize,
    });
    return { ...result, error: null };
  } catch (error) {
    return {
      items: [],
      pagination: EMPTY_PAGINATION,
      error: error instanceof Error ? error.message : "Unable to load your listings.",
    };
  }
}

export default async function OwnerListingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const user = await getSessionUser();

  const rawStatus = first(params.status);
  const rawSortBy = first(params.sortBy);
  const rawSortOrder = first(params.sortOrder);

  const query: ListingsQuery = {
    status: PROPERTY_STATUSES.find((status) => status === rawStatus),
    search: first(params.search),
    sortBy: SORT_FIELDS.find((field) => field === rawSortBy),
    sortOrder: rawSortOrder === "asc" ? "asc" : rawSortOrder === "desc" ? "desc" : undefined,
    page: positiveInt(first(params.page), 1),
    pageSize: Math.min(positiveInt(first(params.pageSize), 12), 100),
  };

  const listings = user ? await loadListings(user.id, query) : { items: [], pagination: EMPTY_PAGINATION, error: null };

  return (
    <>
      <PageHeader
        eyebrow="Owner dashboard"
        title="Your listings"
        description="Filter, search and sort your properties. Everything on this page is driven by the query string, so any view can be bookmarked."
        actions={
          <Button asChild>
            <Link href="/owner/listings/new">
              <Plus />
              New listing
            </Link>
          </Button>
        }
      />

      {user ? (
        <OwnerFilterBar
          searchPlaceholder="Search by title, description or city"
          statusOptions={PROPERTY_STATUSES.map((status) => ({
            value: status,
            label: PROPERTY_STATUS_META[status].label,
          }))}
          sortOptions={[
            { value: "createdAt:desc", label: "Newest first" },
            { value: "createdAt:asc", label: "Oldest first" },
            { value: "title:asc", label: "Title A–Z" },
            { value: "title:desc", label: "Title Z–A" },
            { value: "city:asc", label: "City A–Z" },
            { value: "publishedAt:desc", label: "Recently published" },
          ]}
          chipLabels={{ status: "Status", search: "Search" }}
        />
      ) : (
        <ErrorState title="Not signed in" message="Your session expired. Sign in again to manage your listings." />
      )}

      {listings.error ? <ErrorState title="Could not load listings" message={listings.error} /> : null}

      {!listings.error && listings.items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={query.status ? `No ${PROPERTY_STATUS_META[query.status as PropertyStatus]?.label.toLowerCase() ?? ""} listings` : "No listings yet"}
          description="Create your first property, add rooms and publish it so tenants can request a booking."
          action={{ label: "Create a listing", href: "/owner/listings/new" }}
        />
      ) : null}

      {listings.items.length > 0 ? (
        <>
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Amenities</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.items.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Link
                        href={`/owner/listings/${property.id}`}
                        className="font-medium underline-offset-4 hover:text-primary hover:underline"
                      >
                        {property.title}
                      </Link>
                      <p className="max-w-xs truncate text-xs text-muted-foreground">
                        {property.address}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {property.city}
                      {property.state ? `, ${property.state}` : ""}
                    </TableCell>
                    <TableCell>
                      <PropertyStatusBadge status={property.status} />
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {property.amenities.length}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDate(property.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <ListingActions id={property.id} title={property.title} status={property.status} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination meta={listings.pagination} />
        </>
      ) : null}
    </>
  );
}