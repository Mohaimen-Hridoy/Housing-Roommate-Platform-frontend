"use client";

import { Cell, Pie, PieChart } from "recharts";

import { isEmptySeries, seriesColor, type ChartDatum } from "./chart-theme";
import { ChartFrame, ChartLegend, ChartTooltip } from "./chart-frame";

interface PropertiesByStatusChartProps {
  data: ChartDatum[];
}

/** Property listings split by publication state — doughnut chart. */
export function PropertiesByStatusChart({ data }: PropertiesByStatusChartProps) {
  return (
    <ChartFrame
      title="Properties by status"
      description="Draft, published and archived listings across the platform"
      isEmpty={isEmptySeries(data)}
      emptyMessage="No property has been created yet."
    >
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius="46%" outerRadius="74%" paddingAngle={2} stroke="hsl(var(--card))" strokeWidth={2}>
          {data.map((datum, index) => (
            <Cell key={datum.label} fill={seriesColor(index)} />
          ))}
        </Pie>
        <ChartTooltip />
        <ChartLegend />
      </PieChart>
    </ChartFrame>
  );
}