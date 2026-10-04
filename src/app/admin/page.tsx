import type { Metadata } from "next";
import { Suspense } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  CreditCard,
  Home,
  MessageSquare,
  PiggyBank,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader, SectionHeading } from "@/components/common/page-header";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { FilterSelect } from "@/components/common/url-state";
import {
  BookingsByStatusChart,
  PaymentsByStatusChart,
  PropertiesByStatusChart,
  RoomsByStatusChart,
  TopCitiesChart,
  UsersByRoleChart,
  type ChartDatum,
} from "@/components/dashboard/admin/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/api/endpoints";
import {
  BOOKING_STATUS_META,
  PAYMENT_STATUS_META,
  PROPERTY_STATUS_META,
  ROLE_META,
  ROOM_STATUS_META,
  type StatusMeta,
} from "@/lib/constants";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/format";
import { humanize } from "@/lib/utils";
import type { AdminStats, Role } from "@/lib/types/api";

import { AdminErrorState } from "./admin-error-state";

export const metadata: Metadata = {
  title: "Platform overview",
  description: "Platform-wide analytics: users, listings, occupancy, bookings, revenue and audit activity.",
  robots: { index: false, follow: false, nocache: true },
};

const WINDOW_DAYS = [7, 30, 90, 365] as const;
const DEFAULT_WINDOW = 30;

const WINDOW_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 365 days" },
];

const ROLES: Role[] = ["ADMIN", "OWNER", "TENANT"];

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(params: SearchParams, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Builds an ordered `{ label, value }` series, always emitting every known key. */
function toSeries(
  source: Record<string, number> | Partial<Record<string, number>> | undefined,
  order: readonly string[],
  meta?: Record<string, StatusMeta>,
): ChartDatum[] {
  const counts = source ?? {};
  return order.map((key) => ({
    label: meta?.[key]?.label ?? humanize(key),
    value: counts[key] ?? 0,
  }));
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawDays = Number.parseInt(readParam(params, "days"), 10);
  const days = (WINDOW_DAYS as readonly number[]).includes(rawDays) ? rawDays : DEFAULT_WINDOW;

  let stats: AdminStats | null = null;
  let error: string | null = null;

  try {
    stats = (await adminApi.stats(days)).data;
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load platform statistics";
  }

  if (error || !stats) {
    return (
      <>
        <PageHeader
          eyebrow="Admin console"
          title="Platform overview"
          description="Live figures straight from `GET /admin/stats`."
        />
        <AdminErrorState message={error ?? "No statistics were returned by the API."} />
      </>
    );
  }

  const bookingSeries = toSeries(
    stats.bookings.byStatus,
    ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "EXPIRED"],
    BOOKING_STATUS_META,
  );
  const propertySeries = toSeries(
    stats.properties.byStatus,
    ["DRAFT", "PUBLISHED", "ARCHIVED"],
    PROPERTY_STATUS_META,
  );
  const roomSeries = toSeries(
    stats.rooms.byStatus,
    ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"],
    ROOM_STATUS_META,
  );
  const paymentSeries = toSeries(
    stats.payments.byStatus,
    ["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED", "CANCELED"],
    PAYMENT_STATUS_META,
  );
  const roleSeries = ROLES.map((role) => ({ label: ROLE_META[role].label, value: stats.users.byRole[role] ?? 0 }));
  const citySeries: ChartDatum[] = stats.topCities.map((entry) => ({
    label: entry.city,
    value: entry.properties,
  }));

  const windowLabel = `${days}-day window`;
  const since = formatDate(stats.window.since);

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Platform overview"
        description={`Live figures from the platform API. Trend KPIs use a ${windowLabel} starting ${since}.`}
        actions={
          <Suspense fallback={<div className="h-10 w-[12rem] animate-pulse rounded-lg bg-muted" />}>
            <FilterSelect
              paramKey="days"
              label="Reporting window"
              allLabel="Window"
              options={WINDOW_OPTIONS}
              className="min-w-[13rem]"
            />
          </Suspense>
        }
      />

      <StatCardGrid>
        <StatCard
          label="Total users"
          value={formatNumber(stats.users.total)}
          icon={Users}
          hint={`+${formatNumber(stats.users.newInWindow)} in ${windowLabel} · ${formatNumber(stats.users.verified)} verified`}
          href="/admin/users"
        />
        <StatCard
          label="Published properties"
          value={formatNumber(stats.properties.published)}
          icon={Building2}
          tone="success"
          hint={`${formatNumber(stats.properties.total)} listings in total`}
          href="/admin/properties"
        />
        <StatCard
          label="Rooms"
          value={formatNumber(stats.rooms.total)}
          icon={Home}
          tone="info"
          hint={`${formatPercent(stats.rooms.occupancyRate)} occupancy rate`}
        />
        <StatCard
          label="Total bookings"
          value={formatNumber(stats.bookings.total)}
          icon={CalendarCheck}
          tone="accent"
          hint={`${formatPercent(stats.bookings.approvalRate)} approval rate · +${formatNumber(stats.bookings.newInWindow)} in ${windowLabel}`}
          href="/admin/bookings"
        />
        <StatCard
          label="Gross revenue"
          value={formatCurrency(stats.payments.grossRevenue)}
          icon={CreditCard}
          tone="success"
          hint={`${formatCurrency(stats.payments.revenueInWindow)} in ${windowLabel}`}
          href="/admin/payments"
        />
        <StatCard
          label="Platform fee earned"
          value={formatCurrency(stats.payments.platformFeeEarned)}
          icon={PiggyBank}
          tone="accent"
          hint={`${formatNumber(stats.payments.total)} payments processed`}
        />
        <StatCard
          label="Average rating"
          value={stats.engagement.averageRating > 0 ? stats.engagement.averageRating.toFixed(2) : "—"}
          icon={Star}
          tone="warning"
          hint={`${formatNumber(stats.engagement.reviews)} reviews · ${formatNumber(stats.engagement.favorites)} favourites`}
        />
        <StatCard
          label="Messages"
          value={formatNumber(stats.engagement.messages)}
          icon={MessageSquare}
          tone="default"
          hint="Tenant ↔ owner conversations sent"
        />
      </StatCardGrid>

      <section className="space-y-6">
        <SectionHeading
          title="Distribution"
          description="Every chart is fed by the same stats payload and follows the active theme."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <BookingsByStatusChart data={bookingSeries} days={stats.window.days} />
          <PropertiesByStatusChart data={propertySeries} />
          <RoomsByStatusChart data={roomSeries} occupancyRate={stats.rooms.occupancyRate} />
          <PaymentsByStatusChart data={paymentSeries} />
          <UsersByRoleChart data={roleSeries} />
          <TopCitiesChart data={citySeries} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top properties</CardTitle>
            <CardDescription>Most booked and most saved listings.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topProperties.length === 0 ? (
              <EmptyState
                compact
                icon={Building2}
                title="No listing activity yet"
                description="Once bookings and favourites exist, the strongest listings rank here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Favourites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="max-w-[16rem]">
                        <p className="truncate font-medium">{property.title}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{property.id}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{property.city}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(property.bookings)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(property.favorites)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top cities</CardTitle>
            <CardDescription>Where the listing inventory concentrates.</CardDescription>
          </CardHeader>
          <CardContent>
            {citySeries.length === 0 ? (
              <EmptyState
                compact
                icon={Building2}
                title="No cities yet"
                description="Cities appear as soon as owners publish their first listing."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Properties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citySeries.map((city, index) => (
                    <TableRow key={city.label}>
                      <TableCell className="font-medium">
                        <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                          {index + 1}
                        </span>
                        {city.label}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(city.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <SectionHeading
          title="Activity"
          description="Audit trail volume and engagement counters."
        />
        <StatCardGrid>
          <StatCard
            label="Audit log entries"
            value={formatNumber(stats.activity.auditLogs)}
            icon={ShieldCheck}
            tone="warning"
            hint="Every mutating action, with actor, entity and IP"
            href="/admin/audit-logs"
          />
          <StatCard
            label="Verified accounts"
            value={formatNumber(stats.users.verified)}
            icon={BadgeCheck}
            tone="success"
            hint={`${formatNumber(stats.users.total - stats.users.verified)} still awaiting email verification`}
          />
          <StatCard
            label="Reviews"
            value={formatNumber(stats.engagement.reviews)}
            icon={Star}
            hint={`${stats.engagement.averageRating.toFixed(2)} / 5 average across all subjects`}
          />
          <StatCard
            label="Favourites saved"
            value={formatNumber(stats.engagement.favorites)}
            icon={Home}
            tone="accent"
            hint="Shortlisted properties by tenants"
          />
        </StatCardGrid>
      </section>
    </>
  );
}