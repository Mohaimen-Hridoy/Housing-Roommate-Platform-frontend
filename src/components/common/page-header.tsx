"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useTranslation } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  /** Dictionary key; wins over `label` when the active locale has an entry. */
  labelKey?: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  /** Short label shown above the title, e.g. the section name. */
  eyebrow?: string;
  eyebrowKey?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}

/** Resolves a dictionary key, falling back to the literal English text. */
function useLocalized() {
  const t = useTranslation();
  return (key: string | undefined, fallback: string | undefined) => {
    if (!key) return fallback;
    const value = t(key);
    return value === key ? fallback : value;
  };
}

export function PageHeader({
  title,
  titleKey,
  description,
  descriptionKey,
  eyebrow,
  eyebrowKey,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  const localize = useLocalized();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-foreground">
                    {localize(crumb.labelKey, crumb.label)}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">
                    {localize(crumb.labelKey, crumb.label)}
                  </span>
                )}
                {index < breadcrumbs.length - 1 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          {eyebrow || eyebrowKey ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {localize(eyebrowKey, eyebrow)}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {localize(titleKey, title)}
          </h1>
          {description || descriptionKey ? (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {localize(descriptionKey, description)}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

interface SectionHeadingProps {
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({
  title,
  titleKey,
  description,
  descriptionKey,
  action,
  className,
}: SectionHeadingProps) {
  const localize = useLocalized();

  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{localize(titleKey, title)}</h2>
        {description || descriptionKey ? (
          <p className="text-sm text-muted-foreground">{localize(descriptionKey, description)}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}