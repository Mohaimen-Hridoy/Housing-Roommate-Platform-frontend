import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CtaCardProps {
  eyebrow: string;
  title: string;
  description: string;
  badgeVariant?: "accent" | "info" | "default";
  href: string;
  linkLabel: string;
  badges?: { label: string; icon?: React.ReactNode }[];
}

export function CtaCard({
  eyebrow,
  title,
  description,
  badgeVariant = "accent",
  href,
  linkLabel,
  badges,
}: CtaCardProps) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/[0.04]">
      <CardContent className="flex flex-col items-start gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Badge variant={badgeVariant} className="gap-1.5">
            {badges?.[0]?.icon ?? <Star className="size-3" aria-hidden="true" />}
            {eyebrow}
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
          {badges && badges.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {badges.map((badge) => (
                <Badge key={badge.label} variant="outline" className="gap-1.5">
                  {badge.icon}
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href={href}>
            {linkLabel}
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
