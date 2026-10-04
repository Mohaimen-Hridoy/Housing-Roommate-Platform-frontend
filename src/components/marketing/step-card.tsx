"use client";

interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

export function StepCard({ step, title, description }: StepCardProps) {
  return (
    <li className="relative rounded-xl border border-border bg-card p-6">
      <span className="text-sm font-semibold tabular-nums text-primary">{step}</span>
      <h3 className="mt-2 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </li>
  );
}
