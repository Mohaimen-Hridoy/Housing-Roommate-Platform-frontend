import type { Metadata } from "next";
import Link from "next/link";
import { Building2, DoorOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { BrowseFilters } from "@/components/property/browse-filters";
import { PropertyCard } from "@/components/property/property-card";
import { RoomCard } from "@/components/property/room-card";
import { apiDataSafe, apiListSafe } from "@/lib/api/server";
import { formatNumber } from "@/lib/format";
import type { ImageAsset, PaginationMeta, PropertyListItem, RoomListItem } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Browse properties",
  description:
    "Search verified listings and available rooms by city, rent and bedrooms. Every listing is live from the platform API.",
  openGraph: {
    title: "Browse properties · NestSpace",
    description: "Verified homes and shared rooms, filtered by city, rent and size.",
    url: "/properties",
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value && value.trim() !== "" ? value : undefined;
}

function intParam(value: string | string[] | undefined, fallback: number): number {
  const parsed = Number.parseInt(first(value) ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** `800-1200` → `{ minRent: 800, maxRent: 1200 }`; an open-ended band omits that bound. */
function parsePriceBand(value: string | undefined): { minRent?: number; maxRent?: number } {
  if (!value) return {};
  const [rawMin, rawMax] = value.split("-");
  const minRent = rawMin ? Number.parseInt(rawMin, 10) : undefined;
  const maxRent = rawMax ? Number.parseInt(rawMax, 10) : undefined;
  return {
    ...(minRent !== undefined && Number.isFinite(minRent) ? { minRent } : {}),
    ...(maxRent !== undefined && Number.isFinite(maxRent) ? { maxRent } : {}),
  };
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const view = first(params.view) === "rooms" ? "rooms" : "properties";
  const page = intParam(params.page, 1);
  const pageSize = intParam(params.pageSize, 12);
  const search = first(params.search);
  const city = first(params.city);
  const sortBy = first(params.sortBy) ?? (view === "rooms" ? "rent" : "publishedAt");
  const sortOrder = first(params.sortOrder) ?? (view === "rooms" ? "asc" : "desc");

  const viewHref = (next: "properties" | "rooms") => {
    const query = new URLSearchParams();
    query.set("view", next);
    if (search) query.set("search", search);
    if (city) query.set("city", city);
    query.set("sortBy", next === "rooms" ? "rent" : "publishedAt");
    query.set("sortOrder", next === "rooms" ? "asc" : "desc");
    return `/properties?${query.toString()}`;
  };

  /* ------------------------------------------------------------ properties */

  const propertyResult = await apiListSafe<PropertyListItem>("/properties", {
    query: {
      published: true,
      search,
      city,
      page,
      pageSize,
      sortBy,
      sortOrder,
    },
  });

  const properties: PropertyListItem[] = propertyResult.items;
  const propertyMeta: PaginationMeta = propertyResult.pagination;

  const propertyImages = await Promise.all(
    properties.map(async (property) => {
      const result = await apiDataSafe<ImageAsset[]>(`/properties/${property.id}/images`);
      return [property.id, result.data?.[0] ?? null] as const;
    }),
  );
  const propertyImageById = new Map(propertyImages);

  // Only offer cities that actually exist in the data, never a hardcoded list.
  const cities = [...new Set(properties.map((property) => property.city).filter(Boolean))].sort();

  /* ----------------------------------------------------------------- rooms */

  const { minRent, maxRent } = parsePriceBand(first(params.price));
  const minBedrooms = first(params.bedrooms);
  const availableFrom = first(params.availableFrom);

  const roomResult = await apiListSafe<RoomListItem>("/rooms", {
    query: {
      status: "AVAILABLE",
      search,
      minRent,
      maxRent,
      minBedrooms,
      availableFrom,
      page,
      pageSize,
      sortBy,
      sortOrder,
    },
  });

  const rooms: RoomListItem[] = roomResult.items;
  const roomMeta: PaginationMeta = roomResult.pagination;

  const roomImages = await Promise.all(
    rooms.map(async (room) => {
      const result = await apiDataSafe<ImageAsset[]>(`/rooms/${room.id}/images`);
      return [room.id, result.data?.[0] ?? null] as const;
    }),
  );
  const roomImageById = new Map(roomImages);

  /* ---------------------------------------------------------------- render */

  const showingRooms = view === "rooms";
  const meta = showingRooms ? roomMeta : propertyMeta;
  const resultCount = meta?.totalItems ?? 0;

  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="Marketplace"
        title="Find your next place"
        description="Every listing below is live from the platform API — filter by city, rent or size and bookmark the exact view you want."
      />

      <div className="mt-6 flex gap-2 border-b border-border pb-3" role="tablist" aria-label="Browse by">
        <Button
          role="tab"
          aria-selected={!showingRooms}
          variant={showingRooms ? "ghost" : "default"}
          asChild
        >
          <Link href={viewHref("properties")} scroll={false}>
            <Building2 />
            Properties
          </Link>
        </Button>
        <Button role="tab" aria-selected={showingRooms} variant={showingRooms ? "default" : "ghost"} asChild>
          <Link href={viewHref("rooms")} scroll={false}>
            <DoorOpen />
            Rooms
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <BrowseFilters view={view} cities={cities} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {resultCount === 0
          ? "No matches"
          : `${formatNumber(resultCount)} ${showingRooms ? (resultCount === 1 ? "room" : "rooms") : resultCount === 1 ? "property" : "properties"} found`}
        {page > 1 && meta ? ` · page ${meta.page} of ${meta.totalPages}` : ""}
      </p>

      <div className="mt-4">
        {showingRooms ? (
<RoomResults
            items={rooms}
            imageById={roomImageById}
            error={roomResult.error}
            isEmpty={resultCount === 0}
          />
        ) : (
          <PropertyResults
            items={properties}
            imageById={propertyImageById}
            error={propertyResult.error}
            isEmpty={resultCount === 0}
          />
        )}
      </div>

      {meta && meta.totalPages > 1 ? (
        <Pagination meta={meta} className="mt-10" />
      ) : null}
    </div>
  );
}

interface ResultsProps<T> {
  items: T[];
  imageById: Map<string, ImageAsset | null>;
  error: string | null;
  isEmpty: boolean;
}

function PropertyResults({ items: properties, imageById, error, isEmpty }: ResultsProps<PropertyListItem>) {
  if (error && properties.length === 0) {
    return <ErrorState title="Could not load properties" message={error} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={Building2}
        title="No properties match these filters"
        description="Try removing a filter, widening the price band, or searching a different city."
        action={{ label: "Browse all properties", href: "/properties" }}
      />
    );
  }

  return (
    <>
      {error ? <ErrorState title="Some listings could not be loaded" message={error} className="mb-4" /> : null}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <li key={property.id} className="h-full">
            <PropertyCard property={property} image={imageById.get(property.id) ?? null} />
          </li>
        ))}
      </ul>
    </>
  );
}

function RoomResults({ items: rooms, imageById, error, isEmpty }: ResultsProps<RoomListItem>) {
  if (error && rooms.length === 0) {
    return <ErrorState title="Could not load rooms" message={error} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={DoorOpen}
        title="No available rooms match these filters"
        description="Owners mark rooms available once they are ready. Widen the rent band or clear the date filter to see more."
        action={{ label: "Browse all rooms", href: "/properties?view=rooms" }}
      />
    );
  }

  return (
    <>
      {error ? <ErrorState title="Some rooms could not be loaded" message={error} className="mb-4" /> : null}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <li key={room.id} className="h-full">
            <RoomCard room={room} image={imageById.get(room.id) ?? null} />
          </li>
        ))}
      </ul>
    </>
  );
}