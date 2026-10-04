import type { Metadata } from "next";
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
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: `Answers to common questions about ${APP_NAME} — accounts, searching, bookings, payments, reviews and more.`,
  alternates: { canonical: "/faq" },
};

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

type FaqCategory = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  items: FaqItem[];
};

const CATEGORIES: FaqCategory[] = [
  {
    id: "accounts",
    label: "Accounts & roles",
    items: [
      {
        question: "What are the three user roles?",
        answer: (
          <p>
            NestSpace has three roles: <strong>Tenant</strong> (searches and books rooms),{" "}
            <strong>Owner</strong> (publishes properties and approves bookings), and <strong>Admin</strong>{" "}
            (full platform access for moderation and analytics). Your role is enforced by the backend on every
            request.
          </p>
        ),
      },
      {
        question: "How do I register?",
        answer: (
          <p>
            Visit{" "}
            <Link href="/register" className="text-primary underline">
              /register
            </Link>
            , fill in your name, email and password, and choose a role. You will receive an email verification
            link. Once verified, you will be redirected to the dashboard for your role.
          </p>
        ),
      },
      {
        question: "Can I change my role after registering?",
        answer: (
          <p>
            Role changes are handled by an admin. An admin can assign a new role via the admin dashboard. The
            middleware enforces role-based access on every protected route.
          </p>
        ),
      },
      {
        question: "What if I forget my password?",
        answer: (
          <p>
            Use the{" "}
            <Link href="/forgot-password" className="text-primary underline">
              /forgot-password
            </Link>{" "}
            page to request a password-reset email. The reset link is time-limited and single-use.
          </p>
        ),
      },
    ],
  },
  {
    id: "search",
    label: "Searching & listings",
    items: [
      {
        question: "How do I search for rooms?",
        answer: (
          <p>
            Go to{" "}
            <Link href="/properties" className="text-primary underline">
              /properties
            </Link>{" "}
            and use the filter panel. You can filter by city, rent range, bedrooms, bathrooms, room facing,
            amenities, and availability date. Filters are reflected in the URL, so you can bookmark or share
            your search.
          </p>
        ),
      },
      {
        question: "Who can publish a listing?",
        answer: (
          <p>
            Only users registered as <strong>Owner</strong> or <strong>Admin</strong> can create and publish
            property listings. Tenants cannot publish listings.
          </p>
        ),
      },
      {
        question: "What image formats are supported?",
        answer: (
          <p>
            Upload up to 6 images per entity (property or room). Accepted formats are jpeg, png, webp and
            avif. Each file must be 5 MB or smaller. Images are uploaded to Cloudinary in production or the
            local filesystem in development.
          </p>
        ),
      },
      {
        question: "Can an owner edit a published listing?",
        answer: (
          <p>
            Yes. Owners can update their property and room details at any time. If significant changes are
            made, the property may need to be re-published. Admins can also edit any listing.
          </p>
        ),
      },
    ],
  },
  {
    id: "bookings",
    label: "Bookings",
    items: [
      {
        question: "How do I book a room?",
        answer: (
          <p>
            Find a room on the{" "}
            <Link href="/properties" className="text-primary underline">
              properties page
            </Link>
            , open its detail view, select your start and end dates, optionally write a message to the owner,
            and submit the request. The room becomes RESERVED and the booking enters the PENDING state.
          </p>
        ),
      },
      {
        question: "What booking statuses exist?",
        answer: (
          <div>
            <p>A booking can be in one of five states:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>
                <strong>PENDING</strong> — waiting for the owner&rsquo;s decision
              </li>
              <li>
                <strong>APPROVED</strong> — the owner accepted; payment is now due
              </li>
              <li>
                <strong>REJECTED</strong> — the owner declined; room released
              </li>
              <li>
                <strong>CANCELLED</strong> — either party cancelled; room released
              </li>
              <li>
                <strong>EXPIRED</strong> — the request timed out before a decision
              </li>
            </ul>
          </div>
        ),
      },
      {
        question: "How long does the owner have to respond?",
        answer:
          "The backend enforces a time window for owner responses. If the owner neither approves nor rejects within that window, the booking status flips to EXPIRED and the room returns to AVAILABLE.",
      },
      {
        question: "Can I book multiple rooms at once?",
        answer:
          "Each room requires a separate booking request. There is no cart or multi-room checkout — each booking is tied to a single room and processed independently.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & refunds",
    items: [
      {
        question: "How do payments work?",
        answer: (
          <p>
            Once a booking is APPROVED, the backend creates a Stripe Checkout Session. The tenant is redirected
            to Stripe&rsquo;s hosted payment page. Stripe sends a verified webhook event back to the backend,
            which marks the payment as SUCCEEDED. All payments run in Stripe test mode on this platform.
          </p>
        ),
      },
      {
        question: "Is there a platform fee for tenants?",
        answer: (
          <p>
            No. The platform fee is deducted from the owner&rsquo;s payout, not charged to the tenant. The
            tenant pays only the rent amount set by the owner. The fee percentage is computed server-side from
            the STRIPE_PLATFORM_FEE_PERCENT environment variable (default 5 %).
          </p>
        ),
      },
      {
        question: "When do refunds happen?",
        answer: (
          <p>
            If a booking is CANCELLED after the payment has SUCCEEDED, the backend automatically marks the
            payment as REFUNDED. If the payment has not yet succeeded (PENDING or PROCESSING), no charge
            occurs. Partial refunds are not currently supported — a cancellation refunds the full amount.
          </p>
        ),
      },
      {
        question: "Can I see my payment history?",
        answer: (
          <p>
            Yes. The tenant and owner dashboards display payment statuses for each booking. Admins can see all
            payments across the platform. Payment statuses follow the same lifecycle as bookings: PENDING,
            PROCESSING, SUCCEEDED, FAILED, REFUNDED, PARTIALLY_REFUNDED, CANCELED.
          </p>
        ),
      },
    ],
  },
  {
    id: "reviews",
    label: "Reviews & messaging",
    items: [
      {
        question: "Who can leave a review?",
        answer: (
          <p>
            Only participants of an APPROVED booking can leave a review — that is, the tenant who stayed and
            the property owner. Reviews are limited to the specific booking and cannot be written for rooms or
            properties the user has never booked.
          </p>
        ),
      },
      {
        question: "Can I review a property instead of a room?",
        answer:
          "Yes. Reviews can target either a ROOM or the PROPERTY as a whole. Choose the review subject when submitting.",
      },
      {
        question: "How does messaging work?",
        answer: (
          <p>
            Tenants and owners can send messages through the platform. Messages are linked to a property and
            stored in the database. Every message is associated with the sender and recipient user IDs and
            recorded in the audit log under the MESSAGE_SENT action.
          </p>
        ),
      },
      {
        question: "Are messages moderated?",
        answer:
          "Admins can review messages through the audit log and user management interfaces. Standard users cannot see messages sent between other users.",
      },
    ],
  },
  {
    id: "security",
    label: "Security & privacy",
    items: [
      {
        question: "How is my data protected?",
        answer: (
          <p>
            Authentication uses JWT access tokens with rotating refresh tokens stored as httpOnly cookies.
            JavaScript cannot read the tokens. All API mutations require a valid session, and role-based
            access is enforced in the middleware and again in the backend.
          </p>
        ),
      },
      {
        question: "What is audit logging?",
        answer: (
          <p>
            Every mutating action — booking creation, payment status change, image upload, review submission —
            is recorded in an audit log with the actor ID, entity ID, action type, before and after values, IP
            address and user agent. Admins can inspect the full audit trail.
          </p>
        ),
      },
      {
        question: "Is the platform GDPR-friendly?",
        answer:
          "The platform provides email verification, password reset, and role-based data access. Users can delete their accounts, which cascades according to the backend's data-retention configuration. For full legal review, consult a privacy specialist.",
      },
      {
        question: "Are Stripe webhooks secure?",
        answer:
          "Yes. The backend verifies the Stripe webhook signature using the STRIPE_WEBHOOK_SECRET before processing any payment event. Invalid or unauthenticated webhooks are rejected with a 401 response.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-page space-y-16 py-12 lg:py-16">
      <PageHeader
        title="Frequently Asked Questions"
        description="Everything you need to know about accounts, searching, bookings, payments and more."
        eyebrow="FAQ"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "FAQ" },
        ]}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Card key={category.id}>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-semibold">{category.label}</p>
              <p className="text-xs text-muted-foreground">
                {category.items.length} question{category.items.length === 1 ? "" : "s"}
              </p>
              <Button asChild variant="ghost" size="sm" className="px-0">
                <Link href={`#${category.id}`}>
                  Jump to section
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
          <SectionHeading title={category.label} description="" />
          <Accordion type="single" collapsible className="w-full">
            {category.items.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}

      <Separator />

      <section id="pricing" className="scroll-mt-24 space-y-4">
        <SectionHeading
          title="Pricing and platform fees"
          description="How rent is set, collected and distributed."
        />
        <Card className="border-info/30 bg-info/5">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Rent amounts are set by <strong className="text-foreground">property owners</strong> when they
              create or edit a room. {APP_NAME} does not control or influence rent pricing.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When a booking is approved and the payment{" "}
              <strong className="text-foreground">SUCCEEDED</strong>, the backend computes a{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">platformFee</code> using the{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">STRIPE_PLATFORM_FEE_PERCENT</code>{" "}
              environment variable (default <strong className="text-foreground">5 %</strong> of the booking
              total). This fee is deducted from the gross before the owner&rsquo;s payout. The tenant pays the
              full rent amount at checkout — there is no separate platform-fee line item for tenants, and there
              is no tenant-side listing fee.
            </p>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fee breakdown (example)
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly rent</span>
                  <span className="font-medium">$1,000.00</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenant pays (total)</span>
                  <span className="font-medium">$1,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Platform fee (5 %, server-side)
                  </span>
                  <span className="font-medium text-destructive">-$50.00</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Owner receives</span>
                  <span className="font-semibold text-success">$950.00</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The fee percentage is a backend constant. The frontend displays computed totals returned by the
              API; owners see net earnings in their dashboard analytics.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Badge variant="accent" className="gap-1.5">
            <MessageSquare className="size-3" aria-hidden="true" />
            Still have questions?
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">We&rsquo;re here to help</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Browse the full FAQ above or get in touch. If you want to explore the platform first, the demo
            login gives you instant access to any role.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/contact">
              Contact us
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login#demo">Open demo login</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
