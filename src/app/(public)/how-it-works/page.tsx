import type { Metadata } from "next";
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
import { APP_NAME } from "@/lib/constants";
import { Timeline, StatusTable, FlowDiagram } from "@/components/marketing/timeline";

export const metadata: Metadata = {
  title: "How it works",
  description: `Step-by-step walkthrough of the ${APP_NAME} booking and listing workflow for tenants and owners.`,
  alternates: { canonical: "/how-it-works" },
};

const TENANT_STEPS = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Register as a tenant. You will receive a verification email, then be redirected to your tenant dashboard.",
  },
  {
    step: "02",
    title: "Search and filter rooms",
    description:
      "Browse published listings. Filter by city, rent range, bedrooms, bathrooms, facing direction, amenities, and availability date. Every filter lives in the URL so you can bookmark or share your search.",
  },
  {
    step: "03",
    title: "Open a listing",
    description:
      "View full room details: description, rent, deposit, available-from date, property address, and photo gallery.",
  },
  {
    step: "04",
    title: "Request a booking",
    description:
      "Choose your start and end dates, optionally add a message to the owner, and submit the request. The room status flips to RESERVED and a PENDING booking is created.",
  },
  {
    step: "05",
    title: "Owner approves",
    description:
      "The owner reviews your request and either approves or rejects it. On approval, the room becomes OCCUPIED and a Stripe Checkout session is generated.",
  },
  {
    step: "06",
    title: "Pay through Stripe Checkout",
    description:
      "Complete payment in Stripe's hosted Checkout. The backend listens for the webhook confirmation; once received, the payment status becomes SUCCEEDED.",
  },
  {
    step: "07",
    title: "Move in and review",
    description:
      "Once your stay begins, you can message the owner through the platform. After the booking ends, you may leave a review of the room or property.",
  },
];

const OWNER_STEPS = [
  {
    step: "01",
    title: "Register as an owner",
    description:
      "Sign up with the Owner role. Verify your email, then land on the owner dashboard with an empty portfolio.",
  },
  {
    step: "02",
    title: "Create a property",
    description:
      "Fill in the title, address, city, state, and amenities. Upload up to 6 images (5 MB each, jpeg/png/webp/avif) via Cloudinary or the local filesystem. Set the status to PUBLISHED to make it visible in public search.",
  },
  {
    step: "03",
    title: "Add rooms",
    description:
      "Within each property, add one or more rooms. Set rent, currency, deposit, bedrooms, bathrooms, area, facing direction, and available-from date. Rooms appear in search as soon as the property is published.",
  },
  {
    step: "04",
    title: "Review booking requests",
    description:
      "When a tenant requests a booking, you will see it in the owner dashboard. Approve to open Stripe Checkout; reject to release the room back to AVAILABLE.",
  },
  {
    step: "05",
    title: "Track occupancy and earnings",
    description:
      "The analytics dashboard shows occupancy rate, approval rate, gross revenue, platform fees deducted, and a list of recent bookings and top-performing rooms.",
  },
];

const BOOKING_STATUSES = [
  { label: "PENDING", meaning: "The tenant has submitted a booking request. The room is RESERVED. No payment has been collected yet." },
  { label: "APPROVED", meaning: "The owner accepted the request. The room is OCCUPIED. A Stripe Checkout session is generated for the tenant." },
  { label: "REJECTED", meaning: "The owner declined the request. The room returns to AVAILABLE. No payment is involved." },
  { label: "CANCELLED", meaning: "Either party cancelled an approved or pending booking. The room returns to AVAILABLE. If the payment had already SUCCEEDED, it is refunded automatically." },
  { label: "EXPIRED", meaning: "The request was not acted on within the platform's time window. The room returns to AVAILABLE." },
];

const PAYMENT_FLOW = [
  { label: "Booking approved", description: "Backend creates a PENDING payment record linked to the booking." },
  { label: "Stripe Checkout", description: "Tenant is redirected to Stripe's hosted Checkout page." },
  { label: "Webhook received", description: "Stripe POSTs a verified webhook event to the backend." },
  { label: "Payment SUCCEEDED", description: "Payment status updates; booking stays APPROVED; room stays OCCUPIED." },
  { label: "Cancellation", description: "On booking cancellation, a SUCCEEDED payment is automatically marked REFUNDED." },
];

const PAYMENT_REFUND_RULES = [
  "If a booking is CANCELLED before the tenant pays, no charge occurs.",
  "If a booking is CANCELLED after the payment SUCCEEDED, the full amount is refunded automatically.",
  "If a payment FAILED or is CANCELED, no refund is needed.",
  "The platform fee (default 5 %) is computed by the backend from the environment variable STRIPE_PLATFORM_FEE_PERCENT and is deducted from the gross before any payout to the owner.",
];

const PLATFORM_FEE_NOTE = `The platform fee is a percentage of the booking total, calculated server-side from STRIPE_PLATFORM_FEE_PERCENT (default 5 %). The tenant pays the full amount at checkout; the fee is subtracted from the owner's payout — the tenant never sees a separate platform-fee line item.`;

const WORKFLOW_FAQS = [
  {
    question: "Can a tenant cancel a booking after paying?",
    answer:
      "Yes. If the booking is APPROVED and the payment has SUCCEEDED, the tenant can cancel. The backend automatically marks the payment as REFUNDED and the room returns to AVAILABLE.",
  },
  {
    question: "Can a tenant request a booking on a room that is already occupied?",
    answer:
      "No. The backend validates that the room status is AVAILABLE before allowing a booking request. Once approved, the room flips to OCCUPIED, blocking further requests.",
  },
  {
    question: "What happens if the owner neither approves nor rejects a request?",
    answer:
      "The request will eventually expire and the room will return to AVAILABLE. The exact expiry window is enforced by the backend.",
  },
  {
    question: "Do owners pay anything to list a property?",
    answer:
      "No. Listing a property and adding rooms is free. The platform deducts its fee from booking revenue before payout.",
  },
  {
    question: "Can an owner reject a booking after the tenant has already paid?",
    answer:
      "If the owner rejects, the booking is REJECTED. If the payment had already SUCCEEDED, the backend refunds it automatically. The room returns to AVAILABLE.",
  },
  {
    question: "Are there any fees for tenants?",
    answer:
      "There are no listing fees or subscription fees for tenants. Tenants only pay the rent amount set by the owner, processed through Stripe Checkout.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-page space-y-16 py-12 lg:py-16">
      <PageHeader
        title="How NestSpace works"
        description="End-to-end walkthrough for tenants and owners, from sign-up to moving in."
        eyebrow="The workflow"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "How it works" },
        ]}
      />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">For tenants</h2>
        <p className="text-sm text-muted-foreground">
          Follow these steps to find and book a room on {APP_NAME}.
        </p>
        <Timeline steps={TENANT_STEPS} />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link href="/register">
              Create a tenant account
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/properties">Browse listings</Link>
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">For owners</h2>
        <p className="text-sm text-muted-foreground">
          Publish properties, add rooms, and manage bookings from a single dashboard.
        </p>
        <Timeline steps={OWNER_STEPS} />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link href="/register">
              Create an owner account
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login#demo">Try the demo</Link>
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <SectionHeading
          title="Booking lifecycle"
          description="Every booking moves through clearly defined statuses so tenants and owners always know where things stand."
        />
        <StatusTable statuses={BOOKING_STATUSES} />
      </section>

      <Separator />

      <section className="space-y-4">
        <SectionHeading
          title="Payments and refunds"
          description="How money moves through the platform, end to end."
        />
        <FlowDiagram steps={PAYMENT_FLOW} />
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Refund rules</h3>
          <ul className="space-y-2">
            {PAYMENT_REFUND_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <Card className="border-info/30 bg-info/5">
          <CardContent className="flex gap-3 p-5">
            <Info className="size-5 shrink-0 text-info" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{PLATFORM_FEE_NOTE}</p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4">
        <SectionHeading
          title="Frequently asked questions"
          description="Quick answers to common workflow questions."
        />
        <Accordion type="single" collapsible className="w-full">
          {WORKFLOW_FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/faq">View all FAQs</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Still need help?</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
