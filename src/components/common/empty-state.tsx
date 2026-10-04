"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /**
   * Optional dictionary key for the title. When the active locale has an entry
   * it wins over `title`, so callers can localise without losing the English
   * fallback for locales that are still being filled in.
   */
  titleKey?: string;
  descriptionKey?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
  compact?: boolean;
}

/** Meaningful empty state for every list, table and feed. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  titleKey,
  descriptionKey,
  action,
  className,
  compact,
}: EmptyStateProps) {
  const t = useTranslation();

  const heading = titleKey ? t(titleKey) : title;
  const body = descriptionKey ? t(descriptionKey) : description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
        className,
      )}
    >
      {Icon ? (
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="font-medium text-foreground">{heading === titleKey ? title : heading}</p>
        {body ? (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {body === descriptionKey ? description : body}
          </p>
        ) : null}
      </div>
      {action ? (
        action.href ? (
          <Button asChild variant="outline" size="sm" className="mt-1">
            <a href={action.href}>{action.label}</a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}
