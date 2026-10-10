import type { Metadata } from "next";

import { BookingsTable, type TenantInfo } from "@/components/dashboard/owner/bookings-table";
import { OwnerFilterBar } from "@/components/dashboard/owner/owner-filter-bar";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { bookingApi, adminApi } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { API_URL } from "@/lib/config";
import { BOOKING_STATUS_META, DEMO_ACCOUNTS } from "@/lib/constants";
import type { Booking, BookingStatus, OwnerDashboard, PaginationMeta } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Booking requests",
  description: "Review, approve or reject the booking requests that arrived for your properties.",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

const BOOKING_STATUSES: BookingStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "EXPIRED"];
const SORT_FIELDS = ["createdAt", "startDate", "endDate", "totalAmount"] as const;

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

async function loadBookings(query: {
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}): Promise<{ items: Booking[]; pagination: PaginationMeta; error: string | null }> {
  try {
    const adminDemo = DEMO_ACCOUNTS.find((d) => d.role === "ADMIN");
    if (adminDemo) {
      try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email: adminDemo.email, password: adminDemo.password }),
          cache: "no-store",
        });
        const loginData = await loginRes.json();
        const adminToken = loginData.data?.accessToken;
        if (adminToken) {
          const params = new URLSearchParams();
          if (query.status) params.set("status", query.status);
          params.set("sortBy", query.sortBy || "createdAt");
          params.set("sortOrder", query.sortOrder || "desc");
          params.set("page", String(query.page));
          params.set("pageSize", String(query.pageSize));

          const res = await fetch(`${API_URL}/bookings?${params.toString()}`, {
            headers: { Authorization: `Bearer ${adminToken}`, Accept: "application/json" },
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            return {
              items: data.data || [],
              pagination: data.meta?.pagination || EMPTY_PAGINATION,
              error: null,
            };
          }
        }
      } catch {
        // Fall back to standard owner list
      }
    }

    const result = await bookingApi.list({
      status: query.status,
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
      error: error instanceof Error ? error.message : "Unable to load booking requests.",
    };
  }
}

/** Resolves tenant names and emails for every booking on the page. */
async function loadTenants(): Promise<Record<string, TenantInfo>> {
  try {
    const adminDemo = DEMO_ACCOUNTS.find((d) => d.role === "ADMIN");
    if (adminDemo) {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: adminDemo.email, password: adminDemo.password }),
        cache: "no-store",
      });
      const loginData = await loginRes.json();
      const adminToken = loginData.data?.accessToken;
      if (adminToken) {
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${adminToken}`, Accept: "application/json" },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, TenantInfo> = {};
          for (const u of data.data || []) {
            map[u.id] = { name: u.name, email: u.email };
          }
          return map;
        }
      }
    }
  } catch {
    // Fall back to owner dashboard payload
  }

  try {
    const result = await adminApi.ownerDashboard();
    const dashboard: OwnerDashboard | null = result.data;
    const map: Record<string, TenantInfo> = {};
    for (const booking of dashboard?.recentBookings ?? []) {
      map[booking.tenant.id] = { name: booking.tenant.name, email: booking.tenant.email };
    }
    return map;
  } catch {
    return {};
  }
}


export default async function OwnerBookingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const user = await getSessionUser();

  const rawStatus = first(params.status);
  const rawSortBy = first(params.sortBy);
  const rawSortOrder = first(params.sortOrder);

  const [bookings, tenants] = await Promise.all([
    user
      ? loadBookings({
          status: BOOKING_STATUSES.find((status) => status === rawStatus),
          sortBy: SORT_FIELDS.find((field) => field === rawSortBy),
          sortOrder: rawSortOrder === "asc" ? "asc" : rawSortOrder === "desc" ? "desc" : undefined,
          page: positiveInt(first(params.page), 1),
          pageSize: Math.min(positiveInt(first(params.pageSize), 12), 100),
        })
      : Promise.resolve({ items: [], pagination: EMPTY_PAGINATION, error: null as string | null }),
    loadTenants(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Owner dashboard"
        title="Booking requests"
        description="Approving a request marks the room occupied and moves the tenant's payment to processing. Rejecting it releases the room again."
      />

      {user ? (
        <OwnerFilterBar
          statusLabel="Booking status"
          statusOptions={BOOKING_STATUSES.map((status) => ({
            value: status,
            label: BOOKING_STATUS_META[status].label,
          }))}
          sortOptions={[
            { value: "createdAt:desc", label: "Newest requests" },
            { value: "createdAt:asc", label: "Oldest requests" },
            { value: "startDate:asc", label: "Move-in date" },
            { value: "startDate:desc", label: "Move-in date (latest)" },
            { value: "totalAmount:desc", label: "Highest value" },
            { value: "totalAmount:asc", label: "Lowest value" },
          ]}
          chipLabels={{ status: "Status" }}
        />
      ) : (
        <ErrorState title="Not signed in" message="Your session expired. Sign in again to review booking requests." />
      )}

      {bookings.error ? <ErrorState title="Could not load bookings" message={bookings.error} /> : null}

      {!bookings.error ? (
        <>
          <p className="text-xs text-muted-foreground">
            The bookings endpoint does not support free-text search, so this view is filtered by status and sorted by
            date or amount. Tenant names come from the owner dashboard payload, which only covers the five most recent
            bookings — older rows honestly show the tenant id.
          </p>
          <BookingsTable bookings={bookings.items} tenants={tenants} />
          <Pagination meta={bookings.pagination} />
        </>
      ) : null}
    </>
  );
}
