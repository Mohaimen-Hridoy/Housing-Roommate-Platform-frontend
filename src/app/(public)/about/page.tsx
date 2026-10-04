import type { Metadata } from "next";

import { localizedMetadata } from "@/lib/i18n/metadata";
import Link from "next/link";
import {
  CreditCard,
  Globe2,
  KeyRound,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader, SectionHeading } from "@/components/common/page-header";
import { RevealGroup } from "@/components/brand/reveal-group";
import { T } from "@/components/common/localized-text";
import { APP_NAME } from "@/lib/constants";
import { StatsBand } from "@/components/marketing/stats-band";
import { RoleCard } from "@/components/marketing/role-card";
import type { Role } from "@/lib/types/api";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    titleKey: "about.title",
    descriptionKey: "about.subtitle",
    canonical: "/about",
  });
}

const STATS = [
  { label: "Roles", labelKey: "about.stat.roles", value: "3" },
  { label: "API endpoints", labelKey: "about.stat.endpoints", value: "79" },
  { label: "Auth", labelKey: "about.stat.auth", value: "JWT + refresh" },
  { label: "Payments", labelKey: "about.stat.payments", value: "Stripe" },
  { label: "Database", labelKey: "about.stat.database", value: "PostgreSQL" },
  { label: "Frontend", labelKey: "about.stat.frontend", value: "Next.js 15" },
];

const FEATURES = [
  { icon: ShieldCheck, titleKey: "about.feature.rbac.title", bodyKey: "about.feature.rbac.body" },
  { icon: CreditCard, titleKey: "about.feature.stripe.title", bodyKey: "about.feature.stripe.body" },
  { icon: Lock, titleKey: "about.feature.jwt.title", bodyKey: "about.feature.jwt.body" },
  { icon: KeyRound, titleKey: "about.feature.audit.title", bodyKey: "about.feature.audit.body" },
  { icon: Globe2, titleKey: "about.feature.images.title", bodyKey: "about.feature.images.body" },
];

const ROLES: {
  role: Role;
  title: string;
  titleKey: string;
  description: string;
  descriptionKey: string;
  capabilities: string[];
  capabilityKeys: string[];
}[] = [
  {
    role: "TENANT",
    title: "Tenant",
    titleKey: "auth.role.tenant",
    description: "Tenants are people looking for a room or whole property.",
    descriptionKey: "about.role.tenant.body",
    capabilities: [
      "Search and filter listings by city, rent range, amenities, room features",
      "Request a booking with start and end dates plus a message to the owner",
      "Pay through Stripe Checkout once the booking is approved",
      "Leave a review after a completed stay (on rooms or properties)",
      "View and cancel their own bookings; track payment status",
    ],
    capabilityKeys: [
      "about.role.tenant.cap1",
      "about.role.tenant.cap2",
      "about.role.tenant.cap3",
      "about.role.tenant.cap4",
      "about.role.tenant.cap5",
    ],
  },
  {
    role: "OWNER",
    title: "Owner",
    titleKey: "auth.role.owner",
    description: "Owners publish and manage property listings and room inventory.",
    descriptionKey: "about.role.owner.body",
    capabilities: [
      "Create and publish property listings with photos, amenities and address",
      "Add rooms with rent, bedrooms, bathrooms, area and availability dates",
      "Review, approve or reject incoming booking requests",
      "Track occupancy rate, approval rate and net earnings after platform fees",
      "Access an analytics dashboard with recent bookings and top-performing rooms",
    ],
    capabilityKeys: [
      "about.role.owner.cap1",
      "about.role.owner.cap2",
      "about.role.owner.cap3",
      "about.role.owner.cap4",
      "about.role.owner.cap5",
    ],
  },
  {
    role: "ADMIN",
    title: "Admin",
    titleKey: "auth.role.admin",
    description: "Admins have full platform access.",
    descriptionKey: "about.role.admin.body",
    capabilities: [
      "View and manage all users, properties, rooms, bookings and payments",
      "Access platform-wide analytics: users, bookings, payments, engagement",
      "Trigger refunds and inspect payment statuses",
      "Review and filter audit logs for any entity or action type",
      "Moderate listings and resolve disputes",
    ],
    capabilityKeys: [
      "about.role.admin.cap1",
      "about.role.admin.cap2",
      "about.role.admin.cap3",
      "about.role.admin.cap4",
      "about.role.admin.cap5",
    ],
  },
];

/** Technology names stay as-is; only the row labels are translated. */
const STACK = [
  { label: "Frontend framework", labelKey: "about.stack.frontend", value: "Next.js 15 App Router" },
  { label: "Language", labelKey: "about.stack.language", value: "TypeScript (strict mode)" },
  { label: "Styling", labelKey: "about.stack.styling", value: "Tailwind CSS + shadcn/ui" },
  { label: "Data fetching", labelKey: "about.stack.data", value: "TanStack Query (React Query)" },
  { label: "Forms", labelKey: "about.stack.forms", value: "React Hook Form + Zod" },
  { label: "Icons", labelKey: "about.stack.icons", value: "Lucide React" },
  { label: "Notifications", labelKey: "about.stack.notifications", value: "Sonner" },
  { label: "Charts", labelKey: "about.stack.charts", value: "Recharts" },
  { label: "Backend framework", labelKey: "about.stack.backend", value: "Express.js" },
  { label: "ORM", labelKey: "about.stack.orm", value: "Prisma" },
  { label: "Database", labelKey: "about.stack.database", value: "PostgreSQL" },
  { label: "Authentication", labelKey: "about.stack.auth", value: "JWT + rotating refresh tokens" },
  { label: "Payments", labelKey: "about.stack.payments", value: "Stripe Checkout (test mode)" },
  { label: "Image storage", labelKey: "about.stack.images", value: "Cloudinary / local fallback" },
  { label: "API envelope", labelKey: "about.stack.envelope", value: "Uniform ApiResponse<T>" },
];

export default async function AboutPage() {
  return (
    <RevealGroup className="container-page space-y-16 py-12 lg:py-16" distance={18}>
      <PageHeader
        title="About NestSpace"
        titleKey="about.title"
        description="An open housing and roommate platform built for transparency, speed, and role-based clarity."
        descriptionKey="about.subtitle"
        eyebrow="Our mission"
        eyebrowKey="about.eyebrow"
        breadcrumbs={[
          { label: "Home", labelKey: "common.home", href: "/" },
          { label: "About", labelKey: "nav.about" },
        ]}
      />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          <T k="about.missionTitle" fallback="Why NestSpace exists" />
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          {[1, 2, 3].map((index) => (
            <p key={index}>
              <T
                k={`about.mission${index}`}
                vars={{ app: APP_NAME }}
                fallback={
                  index === 1
                    ? `Finding a room or managing a rental portfolio is fragmented. Listings live on marketplaces, payments go through ad-hoc channels, and communication disappears the moment a tenancy ends. ${APP_NAME} brings all of that into one platform.`
                    : index === 2
? "For tenants, that means verified listings, real-time availability, a structured booking flow, and secure Stripe Checkout payments — no phone calls to confirm a room is still free. For owners, it means a self-service dashboard to publish properties, approve requests, and track occupancy and earnings with computed analytics."
            : "The platform is designed around three distinct roles — Tenant, Owner and Admin — so every user sees only what is relevant to them and every action is auditable."
                }
              />
            </p>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          <T k="about.buildTitle" fallback="How it is built" />
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <T
            k="about.buildBody"
            fallback="NestSpace is a full-stack monorepo frontend that mirrors a real production backend. The backend exposes 79 API endpoints following a uniform envelope, every mutation is logged, and roles are enforced in the middleware and again in every resolver."
          />
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.titleKey}>
                <CardContent className="space-y-3 p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold">
                    <T k={feature.titleKey} fallback={feature.titleKey} />
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <T k={feature.bodyKey} fallback={feature.bodyKey} />
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          <T k="about.stackTitle" fallback="Tech stack" />
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((item) => (
            <div
              key={item.labelKey}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <span className="text-sm text-muted-foreground">
                <T k={item.labelKey} fallback={item.label} />
              </span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <SectionHeading
          title="Built for three roles"
          titleKey="about.rolesTitle"
          description="Every role gets its own dashboard, permission set, and home route."
          descriptionKey="about.rolesSubtitle"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((roleData) => (
            <RoleCard key={roleData.role} {...roleData} />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button asChild>
            <Link href="/register">
              <T k="action.createAccount" fallback="Create an account" />
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

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          <T k="about.overviewTitle" fallback="Platform overview" />
        </h2>
        <StatsBand items={STATS} />
      </section>
    </RevealGroup>
  );
}
