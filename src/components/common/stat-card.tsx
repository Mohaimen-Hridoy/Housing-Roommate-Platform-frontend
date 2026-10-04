import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatTone = "default" | "neutral" | "success" | "warning" | "danger" | "accent" | "info";

const TONE_STYLES: Record<StatTone, { icon: string; value: string }> = {
  default: { icon: "bg-primary/10 text-primary", value: "text-foreground" },
  info: { icon: "bg-primary/10 text-primary", value: "text-foreground" },
  neutral: { icon: "bg-muted text-muted-foreground", value: "text-foreground" },
  success: { icon: "bg-success/12 text-success", value: "text-success" },
  warning: { icon: "bg-warning/15 text-warning", value: "text-warning" },
  danger: { icon: "bg-destructive/12 text-destructive", value: "text-destructive" },
  accent: { icon: "bg-accent/12 text-accent", value: "text-accent" },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: StatTone;
  hint?: string;
  href?: string;
  className?: string;
}

/** KPI tile used across all three dashboards. */
export function StatCard({ label, value, icon: Icon, tone = "default", hint, href, className }: StatCardProps) {
  const styles = TONE_STYLES[tone];

  const body = (
    <Card
      className={cn(
        "interactive-surface relative flex h-full items-start gap-4 overflow-hidden p-5",
        href && "cursor-pointer",
        className,
      )}
    >
      <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/[0.035]" />
      {Icon ? (
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", styles.icon)}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-2xl font-semibold tabular-nums tracking-tight", styles.value)}>{value}</p>
        {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {body}
      </Link>
    );
  }
  return body;
}

export function StatCardSkeleton() {
  return (
    <Card className="flex items-start gap-4 p-5">
      <Skeleton className="size-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    </Card>
  );
}

export function StatCardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}
