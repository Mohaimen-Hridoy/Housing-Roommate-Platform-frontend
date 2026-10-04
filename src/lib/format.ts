import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

/**
 * Currency symbols. `Intl` renders BDT as "BDT" or "৳" depending on locale and
 * often in the wrong position, so the symbol is applied explicitly.
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",
  bdt: "৳",
  eur: "€",
  gbp: "£",
  inr: "₹",
  pkr: "₨",
  npr: "₨",
  cny: "¥",
  jpy: "¥",
  chf: "CHF",
  sek: "kr",
  nzd: "$",
};

/**
 * Bangladeshi Taka groups by lakh and crore (12,50,000), which `en-IN`
 * produces. Every other currency keeps Western grouping.
 */
function currencyLocale(code: string): string {
  return code === "bdt" ? "en-IN" : "en-US";
}

/**
 * Formats an amount in the currency the API supplied. The value is never
 * converted or rescaled — a `usd` record stays in dollars.
 */
export function formatCurrency(amount: number | null | undefined, currency = "usd"): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";

  const code = currency.toLowerCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? code.toUpperCase();
  const fractionDigits = amount % 1 === 0 ? 0 : 2;

  try {
    const formatted = new Intl.NumberFormat(currencyLocale(code), {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
    return `${symbol}${formatted}`;
  } catch {
    return `${symbol} ${amount.toFixed(fractionDigits)}`;
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

/** Nights between two dates. Pending bookings may have no dates yet, which counts as 0. */
export function nightsBetween(start: string | Date | null | undefined, end: string | Date | null | undefined): number {
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
