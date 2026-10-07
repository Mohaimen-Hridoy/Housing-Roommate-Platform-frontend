"use client";

import { useId, useMemo } from "react";
import type { ReactElement } from "react";
import { BarChart3 } from "lucide-react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

import {
  CHART_HEIGHT,
  LEGEND_HEIGHT,
  TOOLTIP_CURSOR,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_LIST_STYLE,
  TOOLTIP_ROW_LABEL_STYLE,
  TOOLTIP_ROW_STYLE,
  TOOLTIP_ROW_VALUE_STYLE,
  TOOLTIP_STYLE,
  TOOLTIP_SWATCH_STYLE,
  seriesColor,
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
 *
 * The header rhythm and the plot box are fixed here, and every chart uses the
 * same plot height and legend strip from `chart-theme`, so the six admin cards
 * align row by row.
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
    <Card className="surface-raised edge-light relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold leading-tight tracking-tight text-foreground">{title}</CardTitle>
          {description ? <CardDescription className="text-xs leading-relaxed text-muted-foreground">{description}</CardDescription> : null}
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
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

/**
 * Resolves `<linearGradient>` ids that are safe to share a document with other
 * charts.
 *
 * `url(#id)` paint servers are looked up against the whole document, so two
 * charts using the same id both resolve to whichever gradient mounted first —
 * exactly what happens on `/admin`, where six charts render at once. The chart's
 * own slug keeps the id readable and different charts can never collide; React's
 * per-instance id makes it safe even if the same chart is mounted twice.
 */
export function useChartGradientIds(slug: string, count = 1): readonly string[] {
  const instanceId = useId();
  const scope = `${slug}-${instanceId}`.replace(/[^a-zA-Z0-9]/g, "");

  return useMemo(
    () => Array.from({ length: Math.max(count, 1) }, (_, index) => `chart-${scope}-fill-${index}`),
    [scope, count],
  );
}

interface ChartGradientOptions {
  /** Series index the first id belongs to — pass the same index the bar uses. */
  from?: number;
  /** Opacity the fill fades to at the far end of the bar. */
  fadeTo?: number;
  direction?: "vertical" | "horizontal";
}

/**
 * `<linearGradient>` elements to spread inside a chart's own `<defs>`.
 *
 * This returns elements rather than a component on purpose: Recharts only
 * forwards raw SVG tags (`defs`, `clipPath`, …) out of a chart's children, so a
 * wrapper component would be silently dropped.
 *
 * Stops are coloured through `style` rather than the `stop-color` presentation
 * attribute, which keeps `var()` resolution guaranteed in every engine.
 */
export function chartGradient(
  ids: readonly string[],
  { from = 0, fadeTo = 0.28, direction = "vertical" }: ChartGradientOptions = {},
): ReactElement[] {
  // Default `objectBoundingBox` units, so bare fractions read as 0%..100%.
  const [x1, y1, x2, y2] = direction === "vertical" ? [0, 0, 0, 1] : [0, 0, 1, 0];

  return ids.map((id, index) => {
    const color = seriesColor(from + index);
    return (
      <linearGradient key={id} id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
        <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: color, stopOpacity: fadeTo }} />
      </linearGradient>
    );
  });
}

interface ChartTooltipEntry {
  color?: string;
  name?: string | number;
  value?: unknown;
}

interface ChartTooltipContentProps {
  active?: boolean;
  label?: unknown;
  payload?: readonly ChartTooltipEntry[];
  /** Formats the value column; defaults to a grouped plain number. */
  valueFormatter?: (value: unknown, name: string) => string;
  /** Set to false when a label row would only repeat the series name. */
  showLabel?: boolean;
}

/**
 * A bar painted with a gradient reports its fill as `url(#id)`, which cannot be
 * used as a `background-color`, so fall back to the flat series colour. The
 * swatch then always matches the mark it labels.
 */
function swatchColor(entry: ChartTooltipEntry, index: number): string {
  const color = typeof entry.color === "string" ? entry.color : "";
  return color && !color.startsWith("url(") ? color : seriesColor(index);
}

/** Themed tooltip body: swatch, quiet label, then the value on a tabular grid. */
export function ChartTooltipContent({
  active,
  label,
  payload,
  valueFormatter,
  showLabel = true,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  const heading = toLabel(label);

  return (
    <div style={TOOLTIP_STYLE}>
      {showLabel && heading ? <p style={TOOLTIP_LABEL_STYLE}>{heading}</p> : null}
      <div style={TOOLTIP_LIST_STYLE}>
        {payload.map((entry, index) => {
          const name = toLabel(entry.name);
          const formatted = valueFormatter
            ? valueFormatter(entry.value, name)
            : formatNumber(toNumber(entry.value));

          return (
            <div key={`${name}-${index}`} style={TOOLTIP_ROW_STYLE}>
              <span
                aria-hidden="true"
                style={{ ...TOOLTIP_SWATCH_STYLE, backgroundColor: swatchColor(entry, index) }}
              />
              <span style={TOOLTIP_ROW_LABEL_STYLE}>{name}</span>
              <span style={TOOLTIP_ROW_VALUE_STYLE}>{formatted}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Themed tooltip shared by every admin chart. */
export function ChartTooltip() {
  return <Tooltip cursor={TOOLTIP_CURSOR} content={<ChartTooltipContent />} />;
}

/** Themed legend shared by every chart. */
export function ChartLegend() {
  return (
    <Legend
      verticalAlign="bottom"
      align="center"
      height={LEGEND_HEIGHT}
      iconType="circle"
      iconSize={9}
      wrapperStyle={{ fontSize: "0.72rem", paddingTop: "0.625rem" }}
      formatter={(value) => <span className="text-muted-foreground">{toLabel(value)}</span>}
    />
  );
}