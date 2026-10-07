import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/brand/count-up";
import { cn } from "@/lib/utils";

export type StatTone = "default" | "neutral" | "success" | "warning" | "danger" | "accent" | "info";

const TONE_STYLES: Record<StatTone, { icon: string; value: string; badge: string }> = {
  default: { icon: "bg-primary/10 text-primary border-primary/20", value: "text-foreground", badge: "text-primary bg-primary/10" },
  info: { icon: "bg-primary/10 text-primary border-primary/20", value: "text-foreground", badge: "text-primary bg-primary/10" },
  neutral: { icon: "bg-muted text-muted-foreground border-border", value: "text-foreground", badge: "text-muted-foreground bg-muted" },
  success: { icon: "bg-success/15 text-success border-success/30", value: "text-success", badge: "text-success bg-success/10" },
  warning: { icon: "bg-warning/15 text-warning border-warning/30", value: "text-warning", badge: "text-warning bg-warning/10" },
  danger: { icon: "bg-destructive/15 text-destructive border-destructive/30", value: "text-destructive", badge: "text-destructive bg-destructive/10" },
  accent: { icon: "bg-accent/15 text-accent-foreground border-accent/30", value: "text-foreground", badge: "text-accent-foreground bg-accent/20" },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: StatTone;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  href?: string;
  className?: string;
}

/** 10/10 Polished KPI tile used across Tenant, Owner and Admin dashboards. */
export function StatCard({ label, value, icon: Icon, tone = "default", hint, trend, href, className }: StatCardProps) {
  const styles = TONE_STYLES[tone];

  const body = (
    <Card
      className={cn(
        "interactive-surface edge-light relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-300 hover:shadow-lg",
        href && "cursor-pointer",
        className,
      )}
    >
      {/* Ambient background aura */}
      <span className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/5 blur-xl -z-0" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={cn("mt-2 text-2xl sm:text-3xl font-bold tabular-nums tracking-tight", styles.value)}>
            {typeof value === "number" && Number.isFinite(value) ? (
              <CountUp value={value} decimals={Number.isInteger(value) ? 0 : 2} />
            ) : (
              value
            )}
          </p>
        </div>

        {Icon ? (
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-xs", styles.icon)}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
        {hint ? <p className="truncate">{hint}</p> : <span />}
        
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums shrink-0",
              trend.positive !== false
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
            )}
          >
            {trend.positive !== false ? (
              <TrendingUp className="size-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="size-3" aria-hidden="true" />
            )}
            {trend.value}
          </span>
        ) : null}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {body}
      </Link>
    );
  }
  return body;
}

export function StatCardSkeleton() {
  return (
    <Card className="flex items-start gap-4 p-5 rounded-2xl border border-border/80">
      <Skeleton className="size-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-20" />
      </div>
    </Card>
  );
}

export function StatCardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}
