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
import { ChartFrame, ChartTooltip } from "./chart-frame";

interface TopCitiesChartProps {
  data: ChartDatum[];
}

/** Busiest cities by listing count — horizontal bar chart. */
export function TopCitiesChart({ data }: TopCitiesChartProps) {
  return (
    <ChartFrame
      title="Top cities by properties"
      description={`Where listings concentrate${data.length ? ` · top ${data.length}` : ""}`}
      isEmpty={isEmptySeries(data)}
      emptyMessage="No city has listings yet."
      height={300}
    >
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 8 }}>
        <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
        <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} />
        <YAxis type="category" dataKey="label" width={96} tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} />
        <ChartTooltip />
        <Bar dataKey="value" name="Properties" radius={[0, 6, 6, 0]} maxBarSize={22} fill={seriesColor(1)}>
          <LabelList dataKey="value" position="right" fill={LABEL_COLOR} fontSize={11} />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}