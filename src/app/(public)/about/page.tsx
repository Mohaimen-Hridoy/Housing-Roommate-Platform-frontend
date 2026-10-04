import type { Metadata } from "next";
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
import { APP_NAME } from "@/lib/constants";
import { StatsBand } from "@/components/marketing/stats-band";
import { RoleCard } from "@/components/marketing/role-card";
import type { Role } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "About NestSpace",
  description: `${APP_NAME} is an open, role-based housing and roommate platform built with Next.js 15, TypeScript, Tailwind, and Express + Prisma + PostgreSQL.`,
  alternates: { canonical: "/about" },
};

const STATS = [
  { label: "Roles", value: "3" },
  { label: "API endpoints", value: "79" },
  { label: "Auth", value: "JWT + refresh" },
  { label: "Payments", value: "Stripe" },
  { label: "Database", value: "PostgreSQL" },
  { label: "Frontend", value: "Next.js 15" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Role-based access control",
    description:
      "Tenants, owners and admins each get their own dashboard and permission set, enforced in the API and middleware so data stays compartmentalised.",
  },
  {
    icon: CreditCard,
    title: "Stripe test-mode payments",
    description:
      "Approved bookings open a Stripe Checkout Session. Payments settle through a verified webhook, and cancellations automatically issue refunds for SUCCEEDED payments.",
  },
  {
    icon: Lock,
    title: "JWT with rotating refresh tokens",
    description:
      "Access tokens carry the user's role and ID; refresh tokens rotate on every use. Tokens are stored as httpOnly cookies so JavaScript never reads them.",
  },
  {
    icon: KeyRound,
    title: "Audit logging",
    description:
      "Every mutating action records the actor, entity, action, before and after values, IP and user agent — making compliance and debugging straightforward.",
  },
  {
    icon: Globe2,
    title: "Image uploads with Cloudinary",
    description:
      "Property and room images go through Cloudinary in production, with a local filesystem fallback for development. Uploads are capped at 6 files of 5 MB in jpeg, png, webp or avif.",
  },
];

const ROLES: { role: Role; title: string; description: string; capabilities: string[] }[] = [
  {
    role: "TENANT",
    title: "Tenant",
    description:
      "Tenants are people looking for a room or whole property. They search and filter listings, request bookings with custom messages, pay through Stripe, and leave reviews after a stay.",
    capabilities: [
      "Search and filter listings by city, rent range, amenities, room features",
      "Request a booking with start and end dates plus a message to the owner",
      "Pay through Stripe Checkout once the booking is approved",
      "Leave a review after a completed stay (on rooms or properties)",
      "View and cancel their own bookings; track payment status",
    ],
  },
  {
    role: "OWNER",
    title: "Owner",
    description:
      "Owners publish and manage property listings and room inventory. They review and approve booking requests, track occupancy, and monitor earnings.",
    capabilities: [
      "Create and publish property listings with photos, amenities and address",
      "Add rooms with rent, bedrooms, bathrooms, area and availability dates",
      "Review, approve or reject incoming booking requests",
      "Track occupancy rate, approval rate and net earnings after platform fees",
      "Access an analytics dashboard with recent bookings and top-performing rooms",
    ],
  },
  {
    role: "ADMIN",
    title: "Admin",
    description:
      "Admins have full platform access. They manage users, view system-wide analytics, trigger refunds, inspect audit logs, and moderate content.",
    capabilities: [
      "View and manage all users, properties, rooms, bookings and payments",
      "Access platform-wide analytics: users, bookings, payments, engagement",
      "Trigger refunds and inspect payment statuses",
      "Review and filter audit logs for any entity or action type",
      "Moderate listings and resolve disputes",
    ],
  },
];

const STACK = [
  { label: "Frontend framework", value: "Next.js 15 App Router" },
  { label: "Language", value: "TypeScript (strict mode)" },
  { label: "Styling", value: "Tailwind CSS + shadcn/ui" },
  { label: "Data fetching", value: "TanStack Query (React Query)" },
  { label: "Forms", value: "React Hook Form + Zod" },
  { label: "Icons", value: "Lucide React" },
  { label: "Notifications", value: "Sonner" },
  { label: "Charts", value: "Recharts" },
  { label: "Backend framework", value: "Express.js" },
  { label: "ORM", value: "Prisma" },
  { label: "Database", value: "PostgreSQL" },
  { label: "Authentication", value: "JWT + rotating refresh tokens" },
  { label: "Payments", value: "Stripe Checkout (test mode)" },
  { label: "Image storage", value: "Cloudinary / local fallback" },
  { label: "API envelope", value: "Uniform ApiResponse<T>" },
];

export default function AboutPage() {
  return (
    <div className="container-page space-y-16 py-12 lg:py-16">
      <PageHeader
        title="About NestSpace"
        description="An open housing and roommate platform built for transparency, speed, and role-based clarity."
        eyebrow="Our mission"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]}
      />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Why NestSpace exists</h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            Finding a room or managing a rental portfolio is fragmented. Listings live on marketplaces, payments go
            through ad-hoc channels, and communication disappears the moment a tenancy ends.{" "}
            <strong className="text-foreground">{APP_NAME}</strong> brings all of that into one platform.
          </p>
          <p>
            For tenants, that means verified listings, real-time availability, a structured booking flow, and secure
            Stripe Checkout payments — no phone calls to confirm a room is still free. For owners, it means a
            self-service dashboard to publish properties, approve requests, and track occupancy and earnings with
            computed analytics.
          </p>
          <p>
            The platform is designed around three distinct roles — Tenant, Owner and Admin — so every user sees
            only what is relevant to them and every action is auditable.
          </p>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">How it is built</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          NestSpace is a full-stack monorepo frontend that mirrors a real production backend. The backend exposes
          79 API endpoints following a uniform envelope, every mutation is logged, and roles are enforced in the
          middleware and again in every resolver.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="space-y-3 p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Tech stack</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <SectionHeading
          title="Built for three roles"
          description="Every role gets its own dashboard, permission set, and home route."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((roleData) => (
            <RoleCard key={roleData.role} {...roleData} />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button asChild>
            <Link href="/register">Create an account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login#demo">Try the demo</Link>
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Platform overview</h2>
        <StatsBand items={STATS} />
      </section>
    </div>
  );
}
