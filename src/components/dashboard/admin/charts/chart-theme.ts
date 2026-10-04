import type { CSSProperties } from "react";

/** Plain, serialisable chart datum — safe to pass from a Server Component. */
export interface ChartDatum {
  label: string;
  value: number;
}

/** Default plot height so every chart card in the grid lines up. */
export const CHART_HEIGHT = 260;

/**
 * Tailwind class matching `CHART_HEIGHT`. Charts outside `ChartFrame` need a
 * height they can still have overridden through a caller's `className`, which a
 * class allows (via `cn`) but an inline `style` would silently outrank. Keep the
 * two in step if `CHART_HEIGHT` ever changes.
 */
export const CHART_HEIGHT_CLASS = "h-[260px]";

/**
 * Theme-aware series colours, resolved from the CSS custom properties in
 * `globals.css` so charts follow the active theme in light and dark mode.
 *
 * The order is deliberate: neighbouring entries step hard in lightness as well
 * as hue, so adjacent bars/slices stay tellable apart in greyscale and for the
 * most common colour-vision deficiencies. Pale steps are alpha variants of a
 * token rather than fixed hexes, which keeps them theme-aware — a hard-coded
 * tint would go muddy the moment `.dark` flips the surface.
 *
 * `--brand` is a fill-only token. It is safe here because nothing in a chart
 * ever sets text in it — ticks, labels and legend text all use muted tokens.
 */
export const CHART_COLORS: readonly string[] = [
  "hsl(var(--primary))", // deep teal — the anchor of the palette
  "hsl(var(--brand))", // vivid amber — the brightest step, fill only
  "hsl(var(--success))", // deep green
  "hsl(var(--primary) / 0.5)", // pale teal wash
  "hsl(var(--destructive))", // red
  "hsl(var(--brand) / 0.55)", // muted amber
  "hsl(var(--success) / 0.45)", // pale green wash
];

/** Axis text: small, quiet and always legible. Never the decorative brand token. */
export const AXIS_COLOR = "hsl(var(--muted-foreground))";
export const AXIS_TICK_FONT_SIZE = 11;
export const AXIS_TICK_MARGIN = 6;
export const AXIS_TICK: { fill: string; fontSize: number } = {
  fill: AXIS_COLOR,
  fontSize: AXIS_TICK_FONT_SIZE,
};

/** Grid sits behind the data, so it is thinner and lighter than the axis text. */
export const GRID_COLOR = "hsl(var(--border) / 0.7)";
export const GRID_DASHARRAY = "2 6";
export const GRID_WIDTH = 1;

/** Value labels float above the plot, so they get real contrast. */
export const LABEL_COLOR = "hsl(var(--foreground))";
export const LABEL_FONT_SIZE = 11;

/** Bars are never sharp rectangles. */
export const BAR_RADIUS_COLUMN: [number, number, number, number] = [6, 6, 0, 0];
export const BAR_RADIUS_ROW: [number, number, number, number] = [0, 6, 6, 0];
export const BAR_RADIUS_PIE = 4;

export const MAX_BAR_SIZE_COLUMN = 52;
export const MAX_BAR_SIZE_ROW = 22;

/**
 * One plot geometry for every chart card. The small negative `left` reclaims the
 * padding the Y axis would otherwise waste; widths are tuned so tick labels keep
 * enough room to read.
 */
export const CHART_MARGIN: { top: number; right: number; bottom: number; left: number } = {
  top: 18,
  right: 12,
  bottom: 4,
  left: -12,
};
export const ROW_CHART_MARGIN: { top: number; right: number; bottom: number; left: number } = {
  top: 8,
  right: 36,
  bottom: 4,
  left: 0,
};

export const VALUE_AXIS_WIDTH = 48;
export const CATEGORY_AXIS_WIDTH = 96;
export const CATEGORY_AXIS_HEIGHT = 44;

/** Reserved legend strip, identical in every chart so plots line up. */
export const LEGEND_HEIGHT = 32;

/**
 * Highlight that follows the pointer across the plot. Typed as SVG props, not
 * `CSSProperties`, because Recharts passes `cursor` straight to an SVG element.
 */
export const TOOLTIP_CURSOR: React.SVGProps<SVGRectElement> = {
  fill: "hsl(var(--primary) / 0.08)",
  radius: 6,
};

export const TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  boxShadow: [
    "0 1px 2px hsl(var(--foreground) / 0.08)",
    "0 16px 32px -12px hsl(var(--foreground) / 0.28)",
  ].join(", "),
  color: "hsl(var(--popover-foreground))",
  minWidth: "9rem",
  padding: "0.625rem 0.75rem",
};

export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  borderBottom: "1px solid hsl(var(--border))",
  color: "hsl(var(--muted-foreground))",
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  marginBottom: "0.5rem",
  paddingBottom: "0.375rem",
  textTransform: "uppercase",
};

export const TOOLTIP_LIST_STYLE: CSSProperties = { display: "grid", gap: "0.3rem" };

export const TOOLTIP_ROW_STYLE: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: "0.5rem",
  lineHeight: "1.1rem",
};

export const TOOLTIP_ROW_LABEL_STYLE: CSSProperties = {
  color: "hsl(var(--popover-foreground) / 0.75)",
  fontSize: "0.75rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** Figures align on the decimal, so values read as a column. */
export const TOOLTIP_ROW_VALUE_STYLE: CSSProperties = {
  color: "hsl(var(--popover-foreground))",
  fontSize: "0.8125rem",
  fontVariantNumeric: "tabular-nums",
  fontWeight: 600,
  marginLeft: "auto",
  whiteSpace: "nowrap",
};

export const TOOLTIP_SWATCH_STYLE: CSSProperties = {
  borderRadius: "9999px",
  boxShadow: "inset 0 0 0 1px hsl(var(--border))",
  flexShrink: 0,
  height: "0.5rem",
  width: "0.5rem",
};

export function seriesColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length] ?? "hsl(var(--primary))";
}

/** Paints a mark with the gradient registered under `id` in the chart's `<defs>`. */
export function gradientFill(id: string): string {
  return `url(#${id})`;
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