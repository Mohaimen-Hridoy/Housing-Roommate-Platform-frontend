"use client";

import { Cell, Pie, PieChart } from "recharts";

import { isEmptySeries, seriesColor, type ChartDatum } from "./chart-theme";
import { ChartFrame, ChartLegend, ChartTooltip } from "./chart-frame";

interface RoomsByStatusChartProps {
  data: ChartDatum[];
  /** Platform-wide occupancy ratio, surfaced in the subtitle. */
  occupancyRate?: number;
}

/** Room inventory split by availability state — doughnut chart. */
export function RoomsByStatusChart({ data, occupancyRate }: RoomsByStatusChartProps) {
  const occupancyHint =
    typeof occupancyRate === "number"
      ? `${(occupancyRate * 100).toFixed(1)}% occupancy`
      : "availability mix";

  return (
    <ChartFrame
      title="Rooms by status"
      description={`Inventory mix · ${occupancyHint}`}
      isEmpty={isEmptySeries(data)}
      emptyMessage="No room has been added to a property yet."
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