import type { Metadata } from "next";
import Link from "next/link";

import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { PageHeader } from "@/components/common/page-header";
import { ActiveFilterChips, FilterSelect, SortSelect } from "@/components/common/url-state";
import { Button } from "@/components/ui/button";
import { BOOKING_STATUS_META } from "@/lib/constants";
import type { Booking, BookingStatus, PropertyDetail, Room } from "@/lib/types/api";

import { BookingsTable, type TenantBookingRow } from "@/components/dashboard/tenant/bookings-table";
import { apiDataSafe, apiListSafe } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "My bookings",
  description: "Every room request you have sent, with live status and payment state.",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = (Object.keys(BOOKING_STATUS_META) as BookingStatus[]).map((status) => ({
  value: status,
  label: BOOKING_STATUS_META[status].label,
}));

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "startDate:asc", label: "Stay starting soonest" },
  { value: "startDate:desc", label: "Stay starting latest" },
  { value: "totalAmount:desc", label: "Highest amount" },
  { value: "totalAmount:asc", label: "Lowest amount" },
];

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TenantBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const status = one(params.status);
  const sortBy = one(params.sortBy) ?? "createdAt";
  const sortOrder = one(params.sortOrder) ?? "desc";
  const page = one(params.page);
  const pageSize = one(params.pageSize);

  const result = await apiListSafe<Booking>("/bookings/mine", {
    query: { status, sortBy, sortOrder, page, pageSize },
  });

  // Resolve listing context in parallel. A missing room or property must not
  // take the whole table down, so each lookup degrades to `null`.
  const roomIds = [...new Set(result.items.map((booking) => booking.roomId))];
  const propertyIds = [...new Set(result.items.map((booking) => booking.propertyId))];

  const [rooms, properties] = await Promise.all([
    Promise.all(roomIds.map(async (id) => [id, await apiDataSafe<Room>(`/rooms/${id}`)] as const)),
    Promise.all(
      propertyIds.map(async (id) => [id, await apiDataSafe<PropertyDetail>(`/properties/${id}`)] as const),
    ),
  ]);

  const roomById = new Map(rooms.map(([id, lookup]) => [id, lookup.data]));
  const propertyById = new Map(properties.map(([id, lookup]) => [id, lookup.data]));

  const rows: TenantBookingRow[] = result.items.map((booking) => {
    const room = roomById.get(booking.roomId);
    const property = propertyById.get(booking.propertyId);
    return {
      booking,
      propertyTitle: property?.title ?? null,
      propertyCity: property?.city ?? null,
      roomTitle: room?.title ?? null,
      roomStatus: room?.status ?? null,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Tenant dashboard"
        title="My bookings"
        description="Requests you have sent to property owners, with the live status of the room and its payment."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Bookings" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/properties">Browse rooms</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect paramKey="status" label="Booking status" allLabel="All statuses" options={STATUS_OPTIONS} />
        <SortSelect options={SORT_OPTIONS} label="Sort bookings" />
      </div>

      <ActiveFilterChips labels={{ status: "Status", sortBy: "Sort by", sortOrder: "Order" }} />

      {result.error ? (
        <ErrorState title="Bookings could not be loaded" message={result.error} />
      ) : (
        <>
          <BookingsTable initialRows={rows} />
          <Pagination meta={result.pagination} />
        </>
      )}
    </>
  );
}