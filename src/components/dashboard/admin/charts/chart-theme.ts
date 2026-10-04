import type { CSSProperties } from "react";

/** Plain, serialisable chart datum — safe to pass from a Server Component. */
export interface ChartDatum {
  label: string;
  value: number;
}

/** Default plot height so every chart card in the grid lines up. */
export const CHART_HEIGHT = 260;

/**
 * Theme-aware series colours. They resolve from the CSS custom properties in
 * `globals.css`, so charts follow the active theme in light and dark mode.
 */
export const CHART_COLORS: readonly string[] = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(var(--primary) / 0.55)",
  "hsl(var(--accent) / 0.55)",
];

export const AXIS_COLOR = "hsl(var(--muted-foreground))";
export const GRID_COLOR = "hsl(var(--border))";
export const LABEL_COLOR = "hsl(var(--foreground))";

export const TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.75rem",
  color: "hsl(var(--popover-foreground))",
  fontSize: "0.75rem",
  boxShadow: "0 8px 24px -12px rgb(0 0 0 / 0.35)",
};

export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "hsl(var(--muted-foreground))",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export function seriesColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length] ?? "hsl(var(--primary))";
}

export function totalOf(data: readonly ChartDatum[]): number {
  return data.reduce((sum, datum) => sum + (Number.isFinite(datum.value) ? datum.value : 0), 0);
}

/** True when a chart has nothing worth plotting, so it renders its empty state. */
export function isEmptySeries(data: readonly ChartDatum[]): boolean {
  return totalOf(data) === 0;
}

/** Recharts hands tooltips/legends loosely typed values — narrow them safely. */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function toLabel(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}