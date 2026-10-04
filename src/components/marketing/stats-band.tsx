"use client";

interface StatsBandProps {
  items: { label: string; value: string }[];
}

export function StatsBand({ items }: StatsBandProps) {
  return (
    <dl className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
