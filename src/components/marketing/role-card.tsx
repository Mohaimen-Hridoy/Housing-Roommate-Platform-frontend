"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/components/common/status-badge";
import { T } from "@/components/common/localized-text";
import type { Role } from "@/lib/types/api";

interface RoleCardProps {
  role: Role;
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  /** Each entry may carry its own dictionary key for the same fallback behaviour. */
  capabilities: string[];
  capabilityKeys?: string[];
}

export function RoleCard({
  role,
  title,
  titleKey,
  description,
  descriptionKey,
  capabilities,
  capabilityKeys,
}: RoleCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {titleKey ? <T k={titleKey} fallback={title} /> : title}
          </h3>
          <RoleBadge role={role} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {descriptionKey ? <T k={descriptionKey} fallback={description} /> : description}
        </p>
        <ul className="space-y-2">
          {capabilities.map((capability, index) => (
            <li
              key={capabilityKeys?.[index] ?? capability}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {capabilityKeys?.[index] ? (
                <T k={capabilityKeys[index]} fallback={capability} />
              ) : (
                capability
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}