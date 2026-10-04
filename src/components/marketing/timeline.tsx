"use client";

import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface TimelineProps {
  steps: { step: string; title: string; description: ReactNode }[];
  heading?: string;
}

export function Timeline({ steps, heading }: TimelineProps) {
  return (
    <div className="space-y-3">
      {heading ? <h3 className="text-base font-semibold">{heading}</h3> : null}
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => (
          <li
            key={item.step}
            className="rounded-xl border border-border bg-card p-5"
          >
            <span className="text-sm font-semibold tabular-nums text-primary">{item.step}</span>
            <h4 className="mt-2 text-sm font-semibold">{item.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface StatusTableProps {
  statuses: { label: string; meaning: string }[];
}

export function StatusTable({ statuses }: StatusTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Meaning
            </th>
          </tr>
        </thead>
        <tbody>
          {statuses.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium">{row.label}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FlowDiagramProps {
  steps: { label: string; description: string }[];
}

export function FlowDiagram({ steps }: FlowDiagramProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <ol className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {steps.map((item, index) => (
            <li key={item.label} className="flex-1">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
