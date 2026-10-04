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
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  AXIS_TICK,
  AXIS_TICK_MARGIN,
  BAR_RADIUS_COLUMN,
  BAR_RADIUS_PIE,
  CATEGORY_AXIS_HEIGHT,
  CHART_HEIGHT_CLASS,
  CHART_MARGIN,
  GRID_COLOR,
  GRID_DASHARRAY,
  GRID_WIDTH,
  MAX_BAR_SIZE_COLUMN,
  TOOLTIP_CURSOR,
  VALUE_AXIS_WIDTH,
  gradientFill,
  seriesColor,
  toNumber,
} from "../admin/charts/chart-theme";
import { ChartTooltipContent, chartGradient, useChartGradientIds } from "../admin/charts/chart-frame";

/** Plain, serialisable chart input produced by the Server Components. */
export interface ChartDatum {
  label: string;
  value: number;
}

/** Currency ticks need a wider gutter, and a smaller size, than plain counts. */
const CURRENCY_MARGIN = { ...CHART_MARGIN, left: -4 };
const CURRENCY_AXIS_WIDTH = 68;
const CURRENCY_AXIS_TICK = { ...AXIS_TICK, fontSize: 10 };

function isEmpty(data: ChartDatum[]): boolean {
  return data.length === 0 || data.every((entry) => !entry.value);
}

function sumOf(data: readonly ChartDatum[]): number {
  return data.reduce((sum, entry) => sum + entry.value, 0);
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
  // One gradient per bar, so each status keeps its own palette step *and* fades.
  const fills = useChartGradientIds("owner-room-status", data.length);

  if (isEmpty(data)) {
    return <EmptyState compact icon={BarIcon} title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cn("w-full", CHART_HEIGHT_CLASS, className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={CHART_MARGIN}>
          <defs>{chartGradient(fills)}</defs>
          <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray={GRID_DASHARRAY} strokeWidth={GRID_WIDTH} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} tickMargin={AXIS_TICK_MARGIN} />
          <YAxis
            allowDecimals={false}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickMargin={AXIS_TICK_MARGIN}
            width={VALUE_AXIS_WIDTH}
          />
          <Tooltip cursor={TOOLTIP_CURSOR} content={<ChartTooltipContent />} />
          <Bar
            dataKey="value"
            name="Rooms"
            fill={gradientFill(fills[0])}
            radius={BAR_RADIUS_COLUMN}
            maxBarSize={MAX_BAR_SIZE_COLUMN}
          >
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={gradientFill(fills[index])} />
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
  const total = sumOf(populated);

  if (populated.length === 0) {
    return <EmptyState compact icon={PieIcon} title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cn("w-full", CHART_HEIGHT_CLASS, className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={
              <ChartTooltipContent
                showLabel={false}
                valueFormatter={(value) => {
                  const count = toNumber(value);
                  return `${formatNumber(count)} of ${formatNumber(total)} · ${formatPercent(count / total)}`;
                }}
              />
            }
          />
          <Pie
            data={populated}
            dataKey="value"
            nameKey="label"
            innerRadius="52%"
            outerRadius="80%"
            paddingAngle={2}
            cornerRadius={BAR_RADIUS_PIE}
            stroke="hsl(var(--card))"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {populated.map((entry, index) => (
              <Cell key={entry.label} fill={seriesColor(index)} />
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
  const [fill] = useChartGradientIds("owner-earnings-monthly");

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
    <div className={cn("w-full", CHART_HEIGHT_CLASS, className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={CURRENCY_MARGIN}>
          <defs>{chartGradient([fill])}</defs>
          <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray={GRID_DASHARRAY} strokeWidth={GRID_WIDTH} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickMargin={AXIS_TICK_MARGIN}
            interval={0}
            angle={-16}
            textAnchor="end"
            height={CATEGORY_AXIS_HEIGHT}
          />
          <YAxis
            tick={CURRENCY_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickMargin={AXIS_TICK_MARGIN}
            width={CURRENCY_AXIS_WIDTH}
            tickFormatter={(value: number) => formatCurrency(value, currency)}
          />
          <Tooltip
            cursor={TOOLTIP_CURSOR}
            content={<ChartTooltipContent valueFormatter={(value) => formatCurrency(toNumber(value), currency)} />}
          />
          <Bar
            dataKey="value"
            name="Booked value"
            fill={gradientFill(fill[0])}
            radius={BAR_RADIUS_COLUMN}
            maxBarSize={MAX_BAR_SIZE_COLUMN}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Colour key rendered under the donut chart, with each status' share. */
export function ChartLegend({ data }: { data: ChartDatum[] }) {
  const populated = data.filter((entry) => entry.value > 0);
  const total = sumOf(populated);
  if (populated.length === 0) return null;

  return (
    <ul className="mt-4 grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2">
      {populated.map((entry, index) => (
        <li key={entry.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_hsl(var(--border))]"
            style={{ backgroundColor: seriesColor(index) }}
          />
          <span className="min-w-0 flex-1 truncate">{entry.label}</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatNumber(entry.value)}
            <span className="ml-1 font-normal text-muted-foreground">
              {total > 0 ? formatPercent(entry.value / total, 0) : "—"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}