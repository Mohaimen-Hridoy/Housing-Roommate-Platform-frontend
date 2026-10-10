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
  TrendingUp,
} from "lucide-react";

import { apiDataSafe, apiListSafe } from "@/lib/api/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/common/smart-image";
import { RoomStatusBadge } from "@/components/common/status-badge";
import { T } from "@/components/common/localized-text";
import { HeroVisual } from "@/components/brand/hero-visual";
import { Reveal } from "@/components/brand/reveal";
import { CountUp } from "@/components/brand/count-up";
import { SpotlightCard } from "@/components/brand/spotlight-card";
import { HeroSearch } from "@/components/property/hero-search";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { NeighborhoodsSection } from "@/components/marketing/neighborhoods";
import { TrustBand } from "@/components/marketing/trust-band";
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
      <section className="aurora grain surface-mint relative border-b border-border overflow-hidden">
        {/* Ambient subtle backglow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10" aria-hidden="true">
          <div className="size-[640px] rounded-full bg-gradient-to-tr from-primary/10 via-mint/15 to-brand/10 blur-3xl opacity-75" />
        </div>

        <div className="container-page py-12 sm:py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            {/* Left Column: Eyebrow, Title, Subtitle, Search, CTAs, Stats */}
            <div className="space-y-6">
              <Reveal distance={16}>
                <Badge variant="accent" className="gap-1.5 px-3 py-1 text-xs font-semibold shadow-xs">
                  <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                  <T k="home.eyebrow" fallback="Housing & roommate platform" />
                </Badge>
              </Reveal>

              <Reveal distance={22} delay={0.06}>
                <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.025em] sm:text-5xl lg:text-[3.35rem]">
                  <span className="text-gradient-brand">
                    <T k="home.titleAccent" fallback="Find a room" />
                  </span>{" "}
                  <T k="home.titleRest" fallback="you will actually want to live in" />
                </h1>
              </Reveal>

              <Reveal distance={20} delay={0.12}>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  <T
                    k="home.subtitle"
                    vars={{ app: APP_NAME }}
                    fallback={`${APP_NAME} connects tenants and property owners. Browse verified rooms, book instantly, and pay securely via Stripe — all from a single intuitive dashboard.`}
                  />
                </p>
              </Reveal>

              <Reveal distance={18} delay={0.16}>
                <HeroSearch />
              </Reveal>

              <Reveal distance={18} delay={0.20}>
                <div className="flex flex-col gap-3 sm:flex-row pt-1">
                  <Button asChild size="lg" className="shadow-md">
                    <Link href="/properties">
                      <T k="home.ctaBrowse" fallback="Browse available rooms" />
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/register">
                      <T k="home.ctaList" fallback="List your property" />
                    </Link>
                  </Button>
                </div>
              </Reveal>

              <Reveal distance={18} delay={0.24}>
                <dl className="grid max-w-lg grid-cols-3 gap-6 border-t border-border/70 pt-6">
                  {[
                    {
                      label: "home.statRoles",
                      value: 3,
                      fallback: "Roles",
                    },
                    {
                      label: "home.statEndpoints",
                      value: 79,
                      fallback: "API endpoints",
                    },
                  ].map((item) => (
                    <div key={item.label} className="stat-accent">
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        <T k={item.label} fallback={item.fallback} />
                      </dt>
                      <dd className="tabular mt-1 text-2xl font-bold">
                        <CountUp value={item.value} />
                      </dd>
                    </div>
                  ))}
                  <div className="stat-accent">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      <T k="home.statPayments" fallback="Payments" />
                    </dt>
                    <dd className="tabular mt-1 text-2xl font-bold">Stripe</dd>
                  </div>
                </dl>
              </Reveal>
            </div>

            {/* Right Column: Live Featured Property Showcase */}
            <Reveal distance={28} delay={0.1} className="order-first lg:order-none">
              <HeroVisual
                property={featuredProperties[0]}
                imageUrl={propertyImageById.get(featuredProperties[0]?.id)?.url}
              />
            </Reveal>
          </div>

          <div className="mt-14 sm:mt-16">
          <Reveal distance={22}>
            <Card className="surface-raised edge-light overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span className="relative flex size-2" aria-hidden="true">
                      <span className="absolute inline-flex size-full rounded-full bg-success animate-pulse-ring" />
                      <span className="relative inline-flex size-2 rounded-full bg-success" />
                    </span>
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
                <ul className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                  {featuredProperties.map((property) => (
                    <li key={property.id}>
                      <Link
                        href={`/properties/${property.id}`}
                        className="group flex items-center gap-4 p-5 transition-colors hover:bg-muted/50 h-full"
                      >
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted image-zoom">
                          <SmartImage
                            image={propertyImageById.get(property.id) ?? null}
                            seed={property.id}
                            alt={property.title}
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                            {property.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground mt-0.5">
                            {property.city}
                            {property.state ? `, ${property.state}` : ""}
                          </p>
                          <p className="text-xs text-primary/80 font-medium mt-1">
                            <T
                              k="home.amenityCount"
                              vars={{ count: property.amenities?.length ?? 0 }}
                              fallback={`${property.amenities?.length ?? 0} amenities`}
                            />
                          </p>
                        </div>
                        <ArrowRight
                          className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          aria-hidden="true"
                        />
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
          </Reveal>
        </div>
        </div>
      </section>

      <TrustBand />

      <div className="divider-glow" aria-hidden="true" />
      <NeighborhoodsSection />

      <div className="divider-glow" aria-hidden="true" />
      <section className="container-page py-16">
        <Reveal distance={20}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <T k="home.featuresTitle" fallback="Everything the workflow needs" />
            </h2>
            <p className="mt-3 text-muted-foreground">
              <T
                k="home.featuresSubtitle"
                fallback="Not a static mockup — every feature below is wired to the live backend API."
              />
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.titleKey} as="article" distance={18} delay={index * 0.06}>
                <SpotlightCard className="h-full">
                  <div className="space-y-3 p-6">
                    <span className="relative flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span
                        className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-semibold">
                      <T k={feature.titleKey} fallback={feature.titleKey} />
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <T k={feature.bodyKey} fallback={feature.bodyKey} />
                    </p>
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      <div className="divider-glow" aria-hidden="true" />
      <section className="bg-muted/30">
        <div className="container-page py-16">
          <Reveal distance={20}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <T k="home.stepsTitle" fallback="How it works" />
              </h2>
              <p className="mt-3 text-muted-foreground">
                <T
                  k="home.stepsSubtitle"
                  fallback="Four steps from signing up to moving in, for both tenants and owners."
                />
              </p>
            </div>
          </Reveal>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item, index) => (
              <Reveal
                key={item.step}
                as="li"
                distance={18}
                delay={index * 0.08}
                className="relative"
              >
                <span
                  className="absolute inset-x-6 -top-3 hidden h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent lg:block"
                  aria-hidden="true"
                />
                <div className="surface interactive-surface h-full p-6">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-primary">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-base font-semibold">
                    <T k={item.titleKey} fallback={item.titleKey} />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <T k={item.bodyKey} fallback={item.bodyKey} />
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {hasContent ? (
        <>
        <div className="divider-glow" aria-hidden="true" />
        <section className="container-page py-16">
          <Reveal distance={18}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
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
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {affordableRooms.map((room, index) => (
              <Reveal key={room.id} as="article" distance={18} delay={index * 0.07}>
                <Link
                  href={`/properties/${room.property?.id ?? room.propertyId}?roomId=${room.id}#booking-card`}
                  className="group surface spotlight glow-ring relative isolate block h-full overflow-hidden transition-transform duration-300 ease-out-expo hover:-translate-y-1.5"
                >
                  <div className="image-zoom relative aspect-[16/10] bg-muted">
                    <SmartImage
                      image={roomImageById.get(room.id) ?? null}
                      seed={room.id}
                      alt={room.title}
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <span
                      className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    <span className="absolute left-3 top-3">
                      <RoomStatusBadge status={room.status} />
                    </span>
                  </div>
                  <div className="space-y-1.5 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold transition-colors group-hover:text-primary">
                        {room.title}
                      </h3>
                      <p className="shrink-0 text-base font-semibold tabular-nums text-primary">
                        {formatCurrency(room.rent, room.currency)}
                        <span className="text-xs font-normal text-muted-foreground">
                          <T k="property.perMonth" fallback="/mo" />
                        </span>
                      </p>
                    </div>
                    {room.property ? (
                      <p className="text-sm text-muted-foreground">
                        {room.property.title} · {room.property.city}
                      </p>
                    ) : null}
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
                      {room.area !== null ? <span>{room.area} m²</span> : null}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
        </>
      ) : null}

      <div className="divider-glow" aria-hidden="true" />
      <TestimonialsSection />

      <section className="container-page pb-20">
        <Reveal distance={22}>
          <Card className="aurora grain relative overflow-hidden border-primary/20 bg-primary/[0.04]">
            <CardContent className="relative flex flex-col items-start gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Badge variant="accent" className="gap-1.5">
                  <Sparkles className="size-3" aria-hidden="true" />
                  <T k="home.eyebrow" fallback="Start your journey" />
                </Badge>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  <T k="cta.readyTitle" fallback="Ready to find your next home?" />
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <T
                    k="cta.readySubtitle"
                    fallback="Join thousands of tenants and owners who manage rent, rooms, and payments seamlessly in one trusted platform."
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
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Button asChild size="lg">
                  <Link href="/register">
                    <T k="action.createAccount" fallback="Get started" />
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/properties">
                    <T k="home.ctaBrowse" fallback="Browse properties" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </>
  );
}
