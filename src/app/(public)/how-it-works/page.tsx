import type { Metadata } from "next";

import { localizedMetadata } from "@/lib/i18n/metadata";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader, SectionHeading } from "@/components/common/page-header";
import { T } from "@/components/common/localized-text";
import { APP_NAME } from "@/lib/constants";
import { Timeline, StatusTable, FlowDiagram } from "@/components/marketing/timeline";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    titleKey: "how.title",
    descriptionKey: "how.subtitle",
    canonical: "/how-it-works",
  });
}

const TENANT_STEPS = [
  { step: "01", title: "Create your account", titleKey: "how.tenant.s1.title", descriptionKey: "how.tenant.s1.body" },
  { step: "02", title: "Search and filter rooms", titleKey: "how.tenant.s2.title", descriptionKey: "how.tenant.s2.body" },
  { step: "03", title: "Open a listing", titleKey: "how.tenant.s3.title", descriptionKey: "how.tenant.s3.body" },
  { step: "04", title: "Request a booking", titleKey: "how.tenant.s4.title", descriptionKey: "how.tenant.s4.body" },
  { step: "05", title: "Owner approves", titleKey: "how.tenant.s5.title", descriptionKey: "how.tenant.s5.body" },
  { step: "06", title: "Pay through Stripe Checkout", titleKey: "how.tenant.s6.title", descriptionKey: "how.tenant.s6.body" },
  { step: "07", title: "Move in and review", titleKey: "how.tenant.s7.title", descriptionKey: "how.tenant.s7.body" },
];

const OWNER_STEPS = [
  { step: "01", title: "Register as an owner", titleKey: "how.owner.s1.title", descriptionKey: "how.owner.s1.body" },
  { step: "02", title: "Create a property", titleKey: "how.owner.s2.title", descriptionKey: "how.owner.s2.body" },
  { step: "03", title: "Add rooms", titleKey: "how.owner.s3.title", descriptionKey: "how.owner.s3.body" },
  { step: "04", title: "Review booking requests", titleKey: "how.owner.s4.title", descriptionKey: "how.owner.s4.body" },
  { step: "05", title: "Track occupancy and earnings", titleKey: "how.owner.s5.title", descriptionKey: "how.owner.s5.body" },
];

const BOOKING_STATUSES = [
  {
    label: "PENDING",
    labelKey: "status.PENDING",
    meaningKey: "how.status.PENDING",
  },
  {
    label: "APPROVED",
    labelKey: "status.APPROVED",
    meaningKey: "how.status.APPROVED",
  },
  {
    label: "REJECTED",
    labelKey: "status.REJECTED",
    meaningKey: "how.status.REJECTED",
  },
  {
    label: "CANCELLED",
    labelKey: "status.CANCELLED",
    meaningKey: "how.status.CANCELLED",
  },
  {
    label: "EXPIRED",
    labelKey: "status.EXPIRED",
    meaningKey: "how.status.EXPIRED",
  },
];

const PAYMENT_FLOW = [
  { label: "Booking approved", labelKey: "how.flow.1.label", descriptionKey: "how.flow.1.body" },
  { label: "Stripe Checkout", labelKey: "how.flow.2.label", descriptionKey: "how.flow.2.body" },
  { label: "Webhook received", labelKey: "how.flow.3.label", descriptionKey: "how.flow.3.body" },
  { label: "Payment SUCCEEDED", labelKey: "how.flow.4.label", descriptionKey: "how.flow.4.body" },
  { label: "Cancellation", labelKey: "how.flow.5.label", descriptionKey: "how.flow.5.body" },
];

const PAYMENT_REFUND_RULES = [
  { text: "If a booking is CANCELLED before the tenant pays, no charge occurs.", key: "how.refund.1" },
  {
    text: "If a booking is CANCELLED after the payment SUCCEEDED, the full amount is refunded automatically.",
    key: "how.refund.2",
  },
  { text: "If a payment FAILED or is CANCELED, no refund is needed.", key: "how.refund.3" },
  {
    text: "The platform fee (default 5 %) is computed by the backend from the environment variable STRIPE_PLATFORM_FEE_PERCENT and is deducted from the gross before any payout to the owner.",
    key: "how.refund.4",
  },
];

const WORKFLOW_FAQS = [
  {
    question: "Can a tenant cancel a booking after paying?",
    questionKey: "how.faq.1.q",
    answerKey: "how.faq.1.a",
  },
  {
    question: "Can a tenant request a booking on a room that is already occupied?",
    questionKey: "how.faq.2.q",
    answerKey: "how.faq.2.a",
  },
  {
    question: "What happens if the owner neither approves nor rejects a request?",
    questionKey: "how.faq.3.q",
    answerKey: "how.faq.3.a",
  },
  {
    question: "Do owners pay anything to list a property?",
    questionKey: "how.faq.4.q",
    answerKey: "how.faq.4.a",
  },
  {
    question: "Can an owner reject a booking after the tenant has already paid?",
    questionKey: "how.faq.5.q",
    answerKey: "how.faq.5.a",
  },
  {
    question: "Are there any fees for tenants?",
    questionKey: "how.faq.6.q",
    answerKey: "how.faq.6.a",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-page space-y-16 py-12 lg:py-16">
      <PageHeader
        title="How NestSpace works"
        titleKey="how.title"
        description="End-to-end walkthrough for tenants and owners, from sign-up to moving in."
        descriptionKey="how.subtitle"
        eyebrow="The workflow"
        eyebrowKey="how.eyebrow"
        breadcrumbs={[
          { label: "Home", labelKey: "common.home", href: "/" },
          { label: "How it works", labelKey: "nav.howItWorks" },
        ]}
      />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          <T k="how.tenantTitle" fallback="For tenants" />
        </h2>
        <p className="text-sm text-muted-foreground">
          <T k="how.tenantSubtitle" vars={{ app: APP_NAME }} fallback={`Follow these steps to find and book a room on ${APP_NAME}.`} />
        </p>
        <Timeline steps={TENANT_STEPS.map((step) => ({ ...step, description: <T k={step.descriptionKey} fallback={step.descriptionKey} /> }))} />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link href="/register">
              <T k="how.tenantCtaAccount" fallback="Create a tenant account" />
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/properties">
              <T k="how.tenantCtaBrowse" fallback="Browse listings" />
            </Link>
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          <T k="how.ownerTitle" fallback="For owners" />
        </h2>
        <p className="text-sm text-muted-foreground">
          <T
            k="how.ownerSubtitle"
            fallback="Publish properties, add rooms, and manage bookings from a single dashboard."
          />
        </p>
        <Timeline steps={OWNER_STEPS.map((step) => ({ ...step, description: <T k={step.descriptionKey} fallback={step.descriptionKey} /> }))} />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link href="/register">
              <T k="how.ownerCtaAccount" fallback="Create an owner account" />
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login#demo">
              <T k="action.tryDemo" fallback="Try the demo" />
            </Link>
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <SectionHeading
          title="Booking lifecycle"
          titleKey="how.lifecycleTitle"
          description="Every booking moves through clearly defined statuses so tenants and owners always know where things stand."
          descriptionKey="how.lifecycleSubtitle"
        />
        <StatusTable
          statuses={BOOKING_STATUSES.map((row) => ({
            ...row,
            meaning: <T k={row.meaningKey} fallback={row.meaningKey} />,
          }))}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <SectionHeading
          title="Payments and refunds"
          titleKey="how.paymentsTitle"
          description="How money moves through the platform, end to end."
          descriptionKey="how.paymentsSubtitle"
        />
        <FlowDiagram
          steps={PAYMENT_FLOW.map((step) => ({
            ...step,
            description: <T k={step.descriptionKey} fallback={step.descriptionKey} />,
          }))}
        />
        <div className="space-y-3">
          <h3 className="text-base font-semibold">
            <T k="how.refundsTitle" fallback="Refund rules" />
          </h3>
          <ul className="space-y-2">
            {PAYMENT_REFUND_RULES.map((rule) => (
              <li key={rule.key} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <T k={rule.key} fallback={rule.text} />
              </li>
            ))}
          </ul>
        </div>
        <Card className="border-info/30 bg-info/5">
          <CardContent className="flex gap-3 p-5">
            <Info className="size-5 shrink-0 text-info" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <T
                k="how.feeNote"
                fallback="The platform fee is a percentage of the booking total, calculated server-side from STRIPE_PLATFORM_FEE_PERCENT (default 5 %). The tenant pays the full amount at checkout; the fee is subtracted from the owner's payout — the tenant never sees a separate platform-fee line item."
              />
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4">
        <SectionHeading
          title="Frequently asked questions"
          titleKey="how.faqTitle"
          description="Quick answers to common workflow questions."
          descriptionKey="how.faqSubtitle"
        />
        <Accordion type="single" collapsible className="w-full">
          {WORKFLOW_FAQS.map((faq, index) => (
            <AccordionItem key={faq.questionKey} value={faq.questionKey ?? `faq-${index}`}>
              <AccordionTrigger className="text-left">
                <T k={faq.questionKey} fallback={faq.question} />
              </AccordionTrigger>
              <AccordionContent>
                <T k={faq.answerKey} fallback={faq.answerKey} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/faq">
              <T k="action.viewAllFaqs" fallback="View all FAQs" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact">
              <T k="action.stillNeedHelp" fallback="Still need help?" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
