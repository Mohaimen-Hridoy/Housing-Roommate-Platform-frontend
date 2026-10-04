"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { AXIS_COLOR, GRID_COLOR, LABEL_COLOR, seriesColor, type ChartDatum } from "./chart-theme";
import { ChartFrame, ChartLegend, ChartTooltip } from "./chart-frame";
import { isEmptySeries } from "./chart-theme";

interface BookingsByStatusChartProps {
  data: ChartDatum[];
  /** Days covered by the parent stats window, shown in the subtitle. */
  days?: number;
}

/** Bookings split by lifecycle status — a vertical bar chart. */
export function BookingsByStatusChart({ data, days }: BookingsByStatusChartProps) {
  return (
    <ChartFrame
      title="Bookings by status"
      description={
        days ? `Every booking ever recorded · ${days}-day trend window applied to the KPIs above` : "Every booking ever recorded"
      }
      isEmpty={isEmptySeries(data)}
      emptyMessage="No booking has been created on the platform yet."
    >
      <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval={0} angle={-16} textAnchor="end" height={44} />
        <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
        <ChartTooltip />
        <ChartLegend />
        <Bar dataKey="value" name="Bookings" radius={[6, 6, 0, 0]} maxBarSize={52} fill={seriesColor(0)}>
          <LabelList dataKey="value" position="top" fill={LABEL_COLOR} fontSize={11} />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}