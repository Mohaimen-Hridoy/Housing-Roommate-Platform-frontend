"use client";

import { BarChart as BarIcon, PieChart as PieIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Plain, serialisable chart input produced by the Server Components. */
export interface ChartDatum {
  label: string;
  value: number;
}

const PALETTE = ["#1450d2", "#0f8a80", "#f59e0b", "#7c3aed", "#dc2626", "#64748b"];

function isEmpty(data: ChartDatum[]): boolean {
  return data.length === 0 || data.every((entry) => !entry.value);
}

interface RoomStatusBarChartProps {
  data: ChartDatum[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

/** Room inventory split by `RoomStatus`, straight from `listings.byRoomStatus`. */
export function RoomStatusBarChart({
  data,
  emptyTitle = "No rooms yet",
  emptyDescription = "Add a room to your first listing and the availability breakdown appears here.",
  className,
}: RoomStatusBarChartProps) {
  if (isEmpty(data)) {
    return <EmptyState compact icon={BarIcon} title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cn("h-64 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={44} />
          <Tooltip
            cursor={{ fill: "rgba(20, 80, 210, 0.06)" }}
            formatter={(value) => [formatNumber(Number(value)), "Rooms"]}
            contentStyle={{ borderRadius: "0.75rem", fontSize: "0.8rem" }}
          />
          <Bar dataKey="value" name="Rooms" radius={[8, 8, 0, 0]} maxBarSize={56}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BookingsStatusDonutChartProps {
  data: ChartDatum[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

/** Booking pipeline split by `BookingStatus`, from `bookings.byStatus`. */
export function BookingsStatusDonutChart({
  data,
  emptyTitle = "No bookings yet",
  emptyDescription = "Once tenants request one of your rooms, the request pipeline shows up here.",
  className,
}: BookingsStatusDonutChartProps) {
  const populated = data.filter((entry) => entry.value > 0);

  if (populated.length === 0) {
    return <EmptyState compact icon={PieIcon} title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            formatter={(value, name) => [`${formatNumber(Number(value))} booking(s)`, String(name)]}
            contentStyle={{ borderRadius: "0.75rem", fontSize: "0.8rem" }}
          />
          <Pie
            data={populated}
            dataKey="value"
            nameKey="label"
            innerRadius="52%"
            outerRadius="80%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {populated.map((entry, index) => (
              <Cell key={entry.label} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface EarningsMonthlyBarChartProps {
  data: ChartDatum[];
  currency: string;
  className?: string;
}

/** Monthly booking value, grouped from the owner's real booking list. */
export function EarningsMonthlyBarChart({ data, currency, className }: EarningsMonthlyBarChartProps) {
  if (isEmpty(data)) {
    return (
      <EmptyState
        compact
        icon={BarIcon}
        title="No booking value to chart yet"
        description="Once a booking is created for one of your rooms, its value is grouped by month here."
        className={className}
      />
    );
  }

  return (
    <div className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -6 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={70}
            tickFormatter={(value: number) => formatCurrency(value, currency)}
          />
          <Tooltip
            cursor={{ fill: "rgba(20, 80, 210, 0.06)" }}
            formatter={(value) => [formatCurrency(Number(value), currency), "Booked value"]}
            contentStyle={{ borderRadius: "0.75rem", fontSize: "0.8rem" }}
          />
          <Bar dataKey="value" name="Booked value" fill={PALETTE[0]} radius={[8, 8, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const LEGEND = ["#1450d2", "#0f8a80", "#f59e0b", "#7c3aed", "#dc2626", "#64748b"];

/** Colour key rendered under the donut chart. */
export function ChartLegend({ data }: { data: ChartDatum[] }) {
  const populated = data.filter((entry) => entry.value > 0);
  if (populated.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
      {populated.map((entry, index) => (
        <li key={entry.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: LEGEND[index % LEGEND.length] }}
          />
          {entry.label}
          <span className="font-medium tabular-nums text-foreground">{formatNumber(entry.value)}</span>
        </li>
      ))}
    </ul>
  );
}