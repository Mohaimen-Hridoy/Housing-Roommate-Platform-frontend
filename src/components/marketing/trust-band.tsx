import { CreditCard, FileCheck, Shield, Sparkles } from "lucide-react";
import { Reveal } from "@/components/brand/reveal";
import { T } from "@/components/common/localized-text";

const TRUST_PILLARS = [
  {
    icon: Shield,
    title: "Verified Spaces",
    titleKey: "trust.verified.title",
    description: "Every room undergoes photo and ownership verification before publishing.",
    descriptionKey: "trust.verified.desc",
  },
  {
    icon: CreditCard,
    title: "Stripe Escrow",
    titleKey: "trust.escrow.title",
    description: "Your deposits and rent stay protected until your move-in is confirmed.",
    descriptionKey: "trust.escrow.desc",
  },
  {
    icon: Sparkles,
    title: "Zero Broker Fees",
    titleKey: "trust.nobroker.title",
    description: "Connect directly with verified owners with no middleman commissions.",
    descriptionKey: "trust.nobroker.desc",
  },
  {
    icon: FileCheck,
    title: "Transparent Terms",
    titleKey: "trust.terms.title",
    description: "Clear house rules, cancellation terms, and automated invoice receipts.",
    descriptionKey: "trust.terms.desc",
  },
];

export function TrustBand() {
  return (
    <section className="border-y border-border/80 bg-card/60 backdrop-blur-xs py-12">
      <div className="container-page">
        <Reveal distance={16}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold tracking-tight text-foreground">
                      <T k={pillar.titleKey} fallback={pillar.title} />
                    </h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <T k={pillar.descriptionKey} fallback={pillar.description} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
