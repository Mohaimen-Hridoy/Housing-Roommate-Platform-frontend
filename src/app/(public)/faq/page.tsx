import type { Metadata } from "next";

import { localizedMetadata } from "@/lib/i18n/metadata";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader, SectionHeading } from "@/components/common/page-header";
import { RevealGroup } from "@/components/brand/reveal-group";
import { T } from "@/components/common/localized-text";
import { APP_NAME } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    titleKey: "faq.title",
    descriptionKey: "faq.subtitle",
    canonical: "/faq",
  });
}

type FaqItem = {
  /** Dictionary key for the question text. */
  questionKey: string;
  /** Dictionary key for the plain-text answer. */
  answerKey?: string;
  /**
   * For answers with an inline link, the copy is split either side of it:
   * `before` renders before the link, `after` renders after it.
   */
  answer?: React.ReactNode;
  link?: { href: string; label: string };
  beforeKey?: string;
  afterKey?: string;
  /** Bullet list rendered under the answer, used for the booking statuses. */
  bullets?: { statusKey: string; textKey: string }[];
};

type FaqCategory = {
  id: string;
  labelKey: string;
  label: string;
  icon?: React.ReactNode;
  items: FaqItem[];
};

const CATEGORIES: FaqCategory[] = [
  {
    id: "accounts",
    label: "Accounts & roles",
    labelKey: "faq.cat.accounts",
    items: [
      {
        questionKey: "faq.accounts.1.q",
        answerKey: "faq.accounts.1.a",
      },
      {
        questionKey: "faq.accounts.2.q",
        beforeKey: "faq.accounts.2.a1",
        link: { href: "/register", label: "/register" },
        afterKey: "faq.accounts.2.a2",
      },
      {
        questionKey: "faq.accounts.3.q",
        answerKey: "faq.accounts.3.a",
      },
      {
        questionKey: "faq.accounts.4.q",
        beforeKey: "faq.accounts.4.a1",
        link: { href: "/forgot-password", label: "/forgot-password" },
        afterKey: "faq.accounts.4.a2",
      },
    ],
  },
  {
    id: "search",
    label: "Searching & listings",
    labelKey: "faq.cat.search",
    items: [
      {
        questionKey: "faq.search.1.q",
        beforeKey: "faq.search.1.a1",
        link: { href: "/properties", label: "/properties" },
        afterKey: "faq.search.1.a2",
      },
      {
        questionKey: "faq.search.2.q",
        answerKey: "faq.search.2.a",
      },
      {
        questionKey: "faq.search.3.q",
        answerKey: "faq.search.3.a",
      },
      {
        questionKey: "faq.search.4.q",
        answerKey: "faq.search.4.a",
      },
    ],
  },
  {
    id: "bookings",
    label: "Bookings",
    labelKey: "faq.cat.bookings",
    items: [
      {
        questionKey: "faq.bookings.1.q",
        beforeKey: "faq.bookings.1.a1",
        link: { href: "/properties", label: "/properties" },
        afterKey: "faq.bookings.1.a2",
      },
      {
        questionKey: "faq.bookings.2.q",
        answerKey: "faq.bookings.2.a.intro",
        bullets: [
          { statusKey: "status.PENDING", textKey: "faq.bookings.2.a.PENDING" },
          { statusKey: "status.APPROVED", textKey: "faq.bookings.2.a.APPROVED" },
          { statusKey: "status.REJECTED", textKey: "faq.bookings.2.a.REJECTED" },
          { statusKey: "status.CANCELLED", textKey: "faq.bookings.2.a.CANCELLED" },
          { statusKey: "status.EXPIRED", textKey: "faq.bookings.2.a.EXPIRED" },
        ],
      },
      {
        questionKey: "faq.bookings.3.q",
        answerKey: "faq.bookings.3.a",
      },
      {
        questionKey: "faq.bookings.4.q",
        answerKey: "faq.bookings.4.a",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & refunds",
    labelKey: "faq.cat.payments",
    items: [
      {
        questionKey: "faq.payments.1.q",
        answerKey: "faq.payments.1.a",
      },
      {
        questionKey: "faq.payments.2.q",
        answerKey: "faq.payments.2.a",
      },
      {
        questionKey: "faq.payments.3.q",
        answerKey: "faq.payments.3.a",
      },
      {
        questionKey: "faq.payments.4.q",
        answerKey: "faq.payments.4.a",
      },
    ],
  },
  {
    id: "reviews",
    label: "Reviews & messaging",
    labelKey: "faq.cat.reviews",
    items: [
      {
        questionKey: "faq.reviews.1.q",
        answerKey: "faq.reviews.1.a",
      },
      {
        questionKey: "faq.reviews.2.q",
        answerKey: "faq.reviews.2.a",
      },
      {
        questionKey: "faq.reviews.3.q",
        answerKey: "faq.reviews.3.a",
      },
      {
        questionKey: "faq.reviews.4.q",
        answerKey: "faq.reviews.4.a",
      },
    ],
  },
  {
    id: "security",
    label: "Security & privacy",
    labelKey: "faq.cat.security",
    items: [
      {
        questionKey: "faq.security.1.q",
        answerKey: "faq.security.1.a",
      },
      {
        questionKey: "faq.security.2.q",
        answerKey: "faq.security.2.a",
      },
      {
        questionKey: "faq.security.3.q",
        answerKey: "faq.security.3.a",
      },
      {
        questionKey: "faq.security.4.q",
        answerKey: "faq.security.4.a",
      },
    ],
  },
];

/** Renders one FAQ answer, handling the plain, inline-link and bullet variants. */
function FaqAnswer({ item }: { item: FaqItem }) {
  if (item.bullets) {
    return (
      <div>
        <p>
          <T k={item.answerKey ?? ""} fallback="" />
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
          {item.bullets.map((bullet) => (
            <li key={bullet.statusKey}>
              <strong>
                <T k={bullet.statusKey} fallback={bullet.statusKey} />
              </strong>{" "}
              <T k={bullet.textKey} fallback={bullet.textKey} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (item.link) {
    return (
      <p>
        <T k={item.beforeKey ?? ""} fallback="" />{" "}
        <Link href={item.link.href} className="text-primary underline">
          {item.link.label}
        </Link>{" "}
        <T k={item.afterKey ?? ""} fallback="" />
      </p>
    );
  }

  return <p>{item.answerKey ? <T k={item.answerKey} fallback={item.answerKey} /> : item.answer}</p>;
}
export default function FaqPage() {
  return (
    <RevealGroup className="container-page space-y-16 py-12 lg:py-16" distance={18}>
      <PageHeader
        title="Frequently Asked Questions"
        titleKey="faq.title"
        description="Everything you need to know about accounts, searching, bookings, payments and more."
        descriptionKey="faq.subtitle"
        eyebrow="FAQ"
        eyebrowKey="faq.eyebrow"
        breadcrumbs={[
          { label: "Home", labelKey: "common.home", href: "/" },
          { label: "FAQ", labelKey: "nav.faq" },
        ]}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Card key={category.id}>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-semibold">
                <T k={category.labelKey} fallback={category.label} />
              </p>
              <p className="text-xs text-muted-foreground">
                <T
                  k="unit.questions"
                  vars={{ count: category.items.length }}
                  fallback={`${category.items.length} question${category.items.length === 1 ? "" : "s"}`}
                />
              </p>
              <Button asChild variant="ghost" size="sm" className="px-0">
                <Link href={`#${category.id}`}>
                  <T k="faq.jump" fallback="Jump to section" />
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {CATEGORIES.map((category) => (
        <section key={category.id} id={category.id} className="scroll-mt-24 space-y-4">
          <SectionHeading
            title={category.label}
            titleKey={category.labelKey}
            description=""
          />
          <Accordion type="single" collapsible className="w-full">
            {category.items.map((item, index) => (
              <AccordionItem key={item.questionKey} value={`${category.id}-${index}`}>
                <AccordionTrigger className="text-left">
                  <T k={item.questionKey} fallback={item.questionKey} />
                </AccordionTrigger>
                <AccordionContent>
                  <FaqAnswer item={item} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}

      <Separator />

      <section id="pricing" className="scroll-mt-24 space-y-4">
        <SectionHeading
          title="Pricing and platform fees"
          titleKey="faq.pricingTitle"
          description="How rent is set, collected and distributed."
          descriptionKey="faq.pricingSubtitle"
        />
        <Card className="border-info/30 bg-info/5">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <T
                k="faq.pricing.p1"
                vars={{ app: APP_NAME }}
                fallback={`Rent amounts are set by property owners when they create or edit a room. ${APP_NAME} does not control or influence rent pricing.`}
              />
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <T
                k="faq.pricing.p2"
                fallback="When a booking is approved and the payment SUCCEEDED, the backend computes a platformFee using the STRIPE_PLATFORM_FEE_PERCENT environment variable (default 5 % of the booking total). This fee is deducted from the gross before the owner's payout. The tenant pays the full rent amount at checkout — there is no separate platform-fee line item for tenants, and there is no tenant-side listing fee."
              />
            </p>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <T k="faq.pricing.example" fallback="Fee breakdown (example)" />
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    <T k="faq.pricing.monthlyRent" fallback="Monthly rent" />
                  </span>
                  <span className="font-medium tabular-nums">{formatCurrency(1000, "BDT")}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    <T k="faq.pricing.tenantPays" fallback="Tenant pays (total)" />
                  </span>
                  <span className="font-medium tabular-nums">{formatCurrency(1000, "BDT")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    <T k="faq.pricing.platformFee" fallback="Platform fee (5 %, server-side)" />
                  </span>
                  <span className="font-medium tabular-nums text-destructive">
                    −{formatCurrency(50, "BDT")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">
                    <T k="faq.pricing.ownerReceives" fallback="Owner receives" />
                  </span>
                  <span className="font-semibold tabular-nums text-success">
                    {formatCurrency(950, "BDT")}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              <T
                k="faq.pricing.note"
                fallback="The fee percentage is a backend constant. The frontend displays computed totals returned by the API; owners see net earnings in their dashboard analytics."
              />
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Badge variant="accent" className="gap-1.5">
            <MessageSquare className="size-3" aria-hidden="true" />
            <T k="faq.helpBadge" fallback="Still have questions?" />
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            <T k="faq.helpTitle" fallback="We’re here to help" />
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            <T
              k="faq.helpBody"
              fallback="Browse the full FAQ above or get in touch. Browse available listings or create an account to get started."
            />
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/contact">
              <T k="action.contactUs" fallback="Contact us" />
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/properties">
              <T k="home.ctaBrowse" fallback="Browse properties" />
            </Link>
          </Button>
        </div>
      </section>
    </RevealGroup>
  );
}
