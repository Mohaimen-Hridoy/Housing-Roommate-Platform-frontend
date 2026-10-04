"use client";

import { BarChart3 } from "lucide-react";
import type { ReactElement } from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

import {
  CHART_HEIGHT,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
  toLabel,
  toNumber,
} from "./chart-theme";

interface ChartFrameProps {
  title: string;
  description?: string;
  /** Render the empty state instead of the plot when true. */
  isEmpty: boolean;
  emptyMessage?: string;
  height?: number;
  children: ReactElement;
}

/**
 * Shared chart shell: title, description, responsive plot and a graceful empty
 * state, so a chart never renders as a blank box.
 */
export function ChartFrame({
  title,
  description,
  isEmpty,
  emptyMessage = "No data recorded for this metric yet.",
  height = CHART_HEIGHT,
  children,
}: ChartFrameProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex-1">
        {isEmpty ? (
          <EmptyState
            compact
            icon={BarChart3}
            title="Nothing to chart yet"
            description={emptyMessage}
            className="h-full min-h-[10rem]"
          />
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Themed tooltip shared by every chart. */
export function ChartTooltip() {
  return (
    <Tooltip
      cursor={{ fill: "hsl(var(--muted) / 0.6)" }}
      contentStyle={TOOLTIP_STYLE}
      labelStyle={TOOLTIP_LABEL_STYLE}
      itemStyle={{ color: "hsl(var(--popover-foreground))", fontSize: "0.75rem" }}
      formatter={(value) => formatNumber(toNumber(value))}
      labelFormatter={(label) => toLabel(label)}
    />
  );
}

/** Themed legend shared by every chart. */
export function ChartLegend() {
  return (
    <Legend
      verticalAlign="bottom"
      height={30}
      iconType="circle"
      iconSize={8}
      wrapperStyle={{ fontSize: "0.72rem", paddingTop: "0.5rem" }}
      formatter={(value) => <span className="text-muted-foreground">{toLabel(value)}</span>}
    />
  );
}