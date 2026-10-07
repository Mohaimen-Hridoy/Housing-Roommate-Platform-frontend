"use client";

import type { LucideIcon } from "lucide-react";
import { FolderSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
  compact?: boolean;
}

/**
 * 10/10 Polished Empty State with attractive layered geometric illustration,
 * ambient glow, and clear actionable CTA.
 */
export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  titleKey,
  descriptionKey,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  const t = useTranslation();

  const heading = titleKey ? t(titleKey) : title;
  const body = descriptionKey ? t(descriptionKey) : description;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/80 bg-card/50 text-center backdrop-blur-xs",
        compact ? "px-4 py-8" : "px-6 py-14",
        className,
      )}
    >
      {/* Decorative ambient background aura */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <div className="size-48 rounded-full bg-gradient-to-tr from-primary/15 via-mint/20 to-transparent blur-3xl" />
      </div>

      {/* Layered illustration container */}
      <div className="relative mb-3 flex items-center justify-center">
        {/* Outer orbital decorative ring */}
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl border border-border/60 bg-muted/40 shadow-xs",
            compact ? "size-14" : "size-20",
          )}
        >
          {/* Inner glowing icon badge */}
          <div
            className={cn(
              "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-mint/20 text-primary shadow-xs",
              compact ? "size-10" : "size-14",
            )}
          >
            <Icon className={cn("shrink-0", compact ? "size-5" : "size-7")} aria-hidden="true" />
          </div>
        </div>

        {/* Small floating decorative orb */}
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary/40 animate-pulse" />
      </div>

      <div className="relative space-y-1.5 max-w-md">
        <h3 className="font-semibold text-foreground tracking-tight text-base sm:text-lg">
          {heading === titleKey ? title : heading}
        </h3>
        {body ? (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {body === descriptionKey ? description : body}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="relative mt-3">
          {action.href ? (
            <Button asChild size="sm" className="shadow-xs font-medium">
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button size="sm" className="shadow-xs font-medium" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
