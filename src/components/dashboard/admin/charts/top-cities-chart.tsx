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
  BAR_RADIUS_ROW,
  CATEGORY_AXIS_WIDTH,
  GRID_COLOR,
  GRID_DASHARRAY,
  GRID_WIDTH,
  LABEL_COLOR,
  LABEL_FONT_SIZE,
  MAX_BAR_SIZE_ROW,
  ROW_CHART_MARGIN,
  gradientFill,
  isEmptySeries,
  type ChartDatum,
} from "./chart-theme";
import { ChartFrame, ChartTooltip, chartGradient, useChartGradientIds } from "./chart-frame";

interface TopCitiesChartProps {
  data: ChartDatum[];
}

/** Busiest cities by listing count — horizontal bar chart. */
export function TopCitiesChart({ data }: TopCitiesChartProps) {
  const [fill] = useChartGradientIds("top-cities");
  const colorIndex = 1;

  return (
    <ChartFrame
      title="Top cities by properties"
      description={`Where listings concentrate${data.length ? ` · top ${data.length}` : ""}`}
      isEmpty={isEmptySeries(data)}
      emptyMessage="No city has listings yet."
      height={300}
    >
      <BarChart data={data} layout="vertical" margin={ROW_CHART_MARGIN}>
        <defs>{chartGradient([fill], { from: colorIndex, direction: "horizontal", fadeTo: 0.35 })}</defs>
        <CartesianGrid horizontal={false} stroke={GRID_COLOR} strokeDasharray={GRID_DASHARRAY} strokeWidth={GRID_WIDTH} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          tickMargin={AXIS_TICK_MARGIN}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={CATEGORY_AXIS_WIDTH}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          tickMargin={AXIS_TICK_MARGIN}
        />
        <ChartTooltip />
        <Bar
          dataKey="value"
          name="Properties"
          fill={gradientFill(fill[0])}
          radius={BAR_RADIUS_ROW}
          maxBarSize={MAX_BAR_SIZE_ROW}
        >
          <LabelList dataKey="value" position="right" fill={LABEL_COLOR} fontSize={LABEL_FONT_SIZE} offset={6} />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}