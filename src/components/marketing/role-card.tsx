"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/components/common/status-badge";
import type { Role } from "@/lib/types/api";

interface RoleCardProps {
  role: Role;
  title: string;
  description: string;
  capabilities: string[];
}

export function RoleCard({ role, title, description, capabilities }: RoleCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <RoleBadge role={role} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        <ul className="space-y-2">
          {capabilities.map((capability) => (
            <li key={capability} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {capability}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
