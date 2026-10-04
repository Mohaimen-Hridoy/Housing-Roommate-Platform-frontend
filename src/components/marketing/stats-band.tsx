"use client";

import { T } from "@/components/common/localized-text";

interface StatsBandItem {
  label: string;
  /** Dictionary key. Wins over `label` when the active locale has an entry. */
  labelKey?: string;
  value: string;
}

interface StatsBandProps {
  items: StatsBandItem[];
}

export function StatsBand({ items }: StatsBandProps) {
  return (
    <dl className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.labelKey ?? item.label}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.labelKey ? <T k={item.labelKey} fallback={item.label} /> : item.label}
          </dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}