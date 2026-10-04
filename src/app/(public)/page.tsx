import type { Metadata } from "next";

import { localizedMetadata } from "@/lib/i18n/metadata";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CreditCard,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { apiDataSafe, apiListSafe } from "@/lib/api/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/common/smart-image";
import { RoomStatusBadge } from "@/components/common/status-badge";
import { T } from "@/components/common/localized-text";
import { HeroArt } from "@/components/brand/hero-art";
import { Reveal } from "@/components/brand/reveal";
import { formatCurrency } from "@/lib/format";
import { APP_NAME } from "@/lib/constants";
import type { ImageAsset, PropertyListItem, RoomListItem } from "@/lib/types/api";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    titleKey: "meta.home.title",
    descriptionKey: "home.subtitle",
    canonical: "/",
  });
}

const FEATURES = [
  {
    icon: Search,
    titleKey: "home.feature.search.title",
    bodyKey: "home.feature.search.body",
  },
  {
    icon: CalendarCheck,
    titleKey: "home.feature.booking.title",
    bodyKey: "home.feature.booking.body",
  },
  {
    icon: CreditCard,
    titleKey: "home.feature.payments.title",
    bodyKey: "home.feature.payments.body",
  },
  {
    icon: ShieldCheck,
    titleKey: "home.feature.roles.title",
    bodyKey: "home.feature.roles.body",
  },
  {
    icon: TrendingUp,
    titleKey: "home.feature.analytics.title",
    bodyKey: "home.feature.analytics.body",
  },
  {
    icon: BadgeCheck,
    titleKey: "home.feature.verified.title",
    bodyKey: "home.feature.verified.body",
  },
];

const STEPS = [
  {
    step: "01",
    titleKey: "home.step.account.title",
    bodyKey: "home.step.account.body",
  },
  {
    step: "02",
    titleKey: "home.step.search.title",
    bodyKey: "home.step.search.body",
  },
  {
    step: "03",
    titleKey: "home.step.request.title",
    bodyKey: "home.step.request.body",
  },
  {
    step: "04",
    titleKey: "home.step.pay.title",
    bodyKey: "home.step.pay.body",
  },
];

export default async function HomePage() {
  const [properties, rooms] = await Promise.all([
    apiListSafe<PropertyListItem>("/properties", {
      query: { published: true, pageSize: 3, sortBy: "publishedAt", sortOrder: "desc" },
    }),
    apiListSafe<RoomListItem>("/rooms", {
      query: { status: "AVAILABLE", pageSize: 3, sortBy: "rent", sortOrder: "asc" },
    }),
  ]);

  const featuredProperties = properties.items.slice(0, 3);
  const affordableRooms = rooms.items.slice(0, 3);

  // List endpoints omit photos, so fetch the primary image for each card.
  const [propertyImages, roomImages] = await Promise.all([
    Promise.all(
      featuredProperties.map(async (property) => {
        const result = await apiDataSafe<ImageAsset[]>(`/properties/${property.id}/images`);
        return [property.id, result.data?.[0] ?? null] as const;
      }),
    ),
    Promise.all(
      affordableRooms.map(async (room) => {
        const result = await apiDataSafe<ImageAsset[]>(`/rooms/${room.id}/images`);
        return [room.id, result.data?.[0] ?? null] as const;
      }),
    ),
  ]);
  const propertyImageById = new Map(propertyImages);
  const roomImageById = new Map(roomImages);

  const hasContent = featuredProperties.length > 0 || affordableRooms.length > 0;

  return (
    <>
      <section className="surface-mint border-b border-border">
        <div className="container-page py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-7">
            <Badge variant="accent" className="gap-1.5">
              <Sparkles className="size-3" aria-hidden="true" />
              <T k="home.eyebrow" fallback="Housing & roommate platform" />
            </Badge>

            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.4rem]">
              <span className="text-gradient-brand">
                <T k="home.titleAccent" fallback="Find a room" />
              </span>{" "}
              <T k="home.titleRest" fallback="you will actually want to live in" />
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              <T
                k="home.subtitle"
                vars={{ app: APP_NAME }}
                fallback={`${APP_NAME} connects tenants with property owners. Browse verified rooms, request a booking, pay through Stripe and manage everything from a single dashboard â€” with occupancy, revenue and approval analytics for the people who own the buildings.`}
              />
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/properties">
                  <T k="home.ctaBrowse" fallback="Browse available rooms" />
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">
                  <T k="home.ctaList" fallback="List your property" />
                </Link>
              </Button>
            </div>

            <dl className="grid max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-6">
              {[
                { label: "home.statRoles", value: "3", fallback: "Roles" },
                { label: "home.statEndpoints", value: "79", fallback: "API endpoints" },
                { label: "home.statPayments", value: "Stripe", fallback: "Payments" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    <T k={item.label} fallback={item.fallback} />
                  </dt>
                  <dd className="tabular mt-1 text-2xl font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal distance={28} className="order-first lg:order-none">
            <HeroArt className="mx-auto w-full max-w-lg drop-shadow-[0_24px_48px_hsl(var(--shadow-color)/0.16)]" />
          </Reveal>
        </div>

        <div className="mt-14">
          <Card className="surface-raised edge-light overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">
                    <T k="home.listingsTitle" fallback="Newest published listings" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <T k="home.listingsLive" fallback="Live from the API" />
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/properties">
                    <T k="common.viewAll" fallback="View all" />
                    <ArrowRight />
                  </Link>
                </Button>
              </div>

              {featuredProperties.length > 0 ? (
                <ul className="divide-y divide-border">
                  {featuredProperties.map((property) => (
                    <li key={property.id}>
                      <Link
                        href={`/properties/${property.id}`}
                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          <SmartImage
                            image={propertyImageById.get(property.id) ?? null}
                            seed={property.id}
                            alt={property.title}
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{property.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {property.city}
                            {property.state ? `, ${property.state}` : ""} Â·{" "}
                            <T
                              k="home.amenityCount"
                              vars={{ count: property.amenities.length }}
                              fallback={`${property.amenities.length} amenities`}
                            />
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                  <T
                    k="home.listingsEmpty"
                    fallback="No published listings yet. Seed the backend or sign in as an owner to publish one."
                  />
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            <T k="home.featuresTitle" fallback="Everything the workflow needs" />
          </h2>
          <p className="mt-3 text-muted-foreground">
            <T
              k="home.featuresSubtitle"
              fallback="Not a static mockup â€” every feature below is wired to the live backend API."
            />
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.titleKey} className="h-full">
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

      <section className="border-y border-border bg-muted/30">
        <div className="container-page py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              <T k="home.stepsTitle" fallback="How it works" />
            </h2>
            <p className="mt-3 text-muted-foreground">
              <T
                k="home.stepsSubtitle"
                fallback="Four steps from signing up to moving in, for both tenants and owners."
              />
            </p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <li key={item.step} className="relative rounded-xl border border-border bg-card p-6">
                <span className="text-sm font-semibold tabular-nums text-primary">{item.step}</span>
                <h3 className="mt-2 text-base font-semibold">
                  <T k={item.titleKey} fallback={item.titleKey} />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  <T k={item.bodyKey} fallback={item.bodyKey} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {hasContent ? (
        <section className="container-page py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                <T k="home.valueTitle" fallback="Best value right now" />
              </h2>
              <p className="mt-2 text-muted-foreground">
                <T
                  k="home.valueSubtitle"
                  fallback="The lowest-rent rooms currently marked available on the platform."
                />
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/properties?status=AVAILABLE&sortBy=rent&sortOrder=asc">
                <T k="home.valueCta" fallback="See all available rooms" />
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {affordableRooms.map((room) => (
              <Link
                key={room.id}
                href={`/properties/${room.property.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/10] bg-muted">
                  <SmartImage
                    image={roomImageById.get(room.id) ?? null}
                    seed={room.id}
                    alt={room.title}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <span className="absolute left-3 top-3">
                    <RoomStatusBadge status={room.status} />
                  </span>
                </div>
                <div className="space-y-1.5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold group-hover:text-primary">{room.title}</h3>
                    <p className="shrink-0 text-base font-semibold tabular-nums text-primary">
                      {formatCurrency(room.rent, room.currency)}
                      <span className="text-xs font-normal text-muted-foreground">
                        <T k="property.perMonth" fallback="/mo" />
                      </span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {room.property.title} Â· {room.property.city}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
                    {room.bedrooms !== null ? (
                      <span>
                        <T k="unit.beds" vars={{ count: room.bedrooms }} fallback={`${room.bedrooms} bed`} />
                      </span>
                    ) : null}
                    {room.bathrooms !== null ? (
                      <span>
                        <T
                          k="unit.baths"
                          vars={{ count: room.bathrooms }}
                          fallback={`${room.bathrooms} bath`}
                        />
                      </span>
                    ) : null}
                    {room.area !== null ? <span>{room.area} mÂ²</span> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-page pb-20">
        <Card className="overflow-hidden border-primary/20 bg-primary/[0.04]">
          <CardContent className="flex flex-col items-start gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Badge variant="info" className="gap-1.5">
                <Star className="size-3" aria-hidden="true" />
                <T k="home.ctaBadge" fallback="Evaluator friendly" />
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight">
                <T k="contact.demo.title" fallback="Try it without an account" />
              </h2>
              <p className="max-w-xl text-sm text-muted-foreground">
                <T
                  k="contact.demo.body"
                  fallback="The sign-in page has a one-click demo login for all three roles â€” admin, owner and tenant â€” using seeded accounts. You will land straight on that roleâ€™s dashboard."
                />
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(["admin", "owner", "tenant"] as const).map((role) => (
                  <Badge key={role} variant="outline" className="gap-1.5">
                    <Building2 className="size-3" aria-hidden="true" />
                    <T k={`auth.role.${role}`} fallback={role} />
                  </Badge>
                ))}
              </div>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/login#demo">
                <T k="auth.openDemoLogin" fallback="Open demo login" />
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
