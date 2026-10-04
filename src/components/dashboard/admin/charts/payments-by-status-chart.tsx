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
  AXIS_COLOR,
  GRID_COLOR,
  LABEL_COLOR,
  isEmptySeries,
  seriesColor,
  type ChartDatum,
} from "./chart-theme";
import { ChartFrame, ChartLegend, ChartTooltip } from "./chart-frame";

interface PaymentsByStatusChartProps {
  data: ChartDatum[];
}

/** Payments split by settlement status — a vertical bar chart. */
export function PaymentsByStatusChart({ data }: PaymentsByStatusChartProps) {
  return (
    <ChartFrame
      title="Payments by status"
      description="Every payment attempt, from pending through refunds"
      isEmpty={isEmptySeries(data)}
      emptyMessage="No payment has been created yet."
    >
      <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval={0} angle={-16} textAnchor="end" height={44} />
        <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
        <ChartTooltip />
        <ChartLegend />
        <Bar dataKey="value" name="Payments" radius={[6, 6, 0, 0]} maxBarSize={52} fill={seriesColor(3)}>
          <LabelList dataKey="value" position="top" fill={LABEL_COLOR} fontSize={11} />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}