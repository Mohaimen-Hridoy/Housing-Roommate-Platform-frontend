import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatCurrency(amount: number | null | undefined, currency = "usd"): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(ratio: number | null | undefined, digits = 1): string {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return "—";
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function formatDate(value: string | Date | null | undefined, pattern = "d MMM yyyy"): string {
  const date = toDate(value);
  return date ? format(date, pattern) : "—";
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "d MMM yyyy, h:mm a");
}

export function formatRelative(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function formatMonthYear(value: string | Date | null | undefined): string {
  return formatDate(value, "MMM yyyy");
}

/** `2026-03-01` value for `<input type="date">`. */
export function toDateInputValue(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function nightsBetween(start: string | Date, end: string | Date): number {
  const from = toDate(start);
  const to = toDate(end);
  if (!from || !to) return 0;
  const ms = to.getTime() - from.getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function formatArea(squareMetres: number | null | undefined): string {
  if (!squareMetres) return "—";
  return `${squareMetres} m²`;
}

/** Shortens long text for table cells and card summaries. */
export function truncate(value: string | null | undefined, max: number): string {
  if (!value) return "—";
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}
