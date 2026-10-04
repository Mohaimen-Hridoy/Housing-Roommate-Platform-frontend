"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  AXIS_TICK,
  AXIS_TICK_MARGIN,
  BAR_RADIUS_COLUMN,
  CATEGORY_AXIS_HEIGHT,
  CHART_MARGIN,
  GRID_COLOR,
  GRID_DASHARRAY,
  GRID_WIDTH,
  LABEL_COLOR,
  LABEL_FONT_SIZE,
  MAX_BAR_SIZE_COLUMN,
  VALUE_AXIS_WIDTH,
  gradientFill,
  isEmptySeries,
  type ChartDatum,
} from "./chart-theme";
import { ChartFrame, ChartLegend, ChartTooltip, chartGradient, useChartGradientIds } from "./chart-frame";

interface BookingsByStatusChartProps {
  data: ChartDatum[];
  /** Days covered by the parent stats window, shown in the subtitle. */
  days?: number;
}

/** Bookings split by lifecycle status — a vertical bar chart. */
export function BookingsByStatusChart({ data, days }: BookingsByStatusChartProps) {
  const [fill] = useChartGradientIds("bookings-by-status");
  const colorIndex = 0;

  return (
    <ChartFrame
      title="Bookings by status"
      description={
        days ? `Every booking ever recorded · ${days}-day trend window applied to the KPIs above` : "Every booking ever recorded"
      }
      isEmpty={isEmptySeries(data)}
      emptyMessage="No booking has been created on the platform yet."
    >
      <BarChart data={data} margin={CHART_MARGIN}>
        <defs>{chartGradient([fill], { from: colorIndex })}</defs>
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
          allowDecimals={false}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          tickMargin={AXIS_TICK_MARGIN}
          width={VALUE_AXIS_WIDTH}
        />
        <ChartTooltip />
        <ChartLegend />
        <Bar
          dataKey="value"
          name="Bookings"
          fill={gradientFill(fill[0])}
          radius={BAR_RADIUS_COLUMN}
          maxBarSize={MAX_BAR_SIZE_COLUMN}
        >
          <LabelList dataKey="value" position="top" fill={LABEL_COLOR} fontSize={LABEL_FONT_SIZE} offset={6} />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}