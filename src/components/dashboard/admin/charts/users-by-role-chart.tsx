"use client";

import { Cell, Pie, PieChart } from "recharts";

import { BAR_RADIUS_PIE, isEmptySeries, seriesColor, type ChartDatum } from "./chart-theme";
import { ChartFrame, ChartLegend, ChartTooltip } from "./chart-frame";

interface UsersByRoleChartProps {
  data: ChartDatum[];
}

/** Registered accounts split by role — doughnut chart. */
export function UsersByRoleChart({ data }: UsersByRoleChartProps) {
  return (
    <ChartFrame
      title="Users by role"
      description="Admins, owners and tenants holding an account"
      isEmpty={isEmptySeries(data)}
      emptyMessage="No user has registered yet."
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="48%"
          outerRadius="74%"
          paddingAngle={2}
          cornerRadius={BAR_RADIUS_PIE}
          stroke="hsl(var(--card))"
          strokeWidth={2}
          isAnimationActive={false}
        >
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