import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Compass,
  MapPin,
  Ruler,
  Sparkles,
} from "lucide-react";

import { BookingWizard } from "@/components/property/booking-wizard";
import { ContactOwnerButton } from "@/components/property/contact-owner-button";
import { FavoriteButton } from "@/components/property/favorite-button";
import { SubjectReviews } from "@/components/property/subject-reviews";
import { ErrorState } from "@/components/common/error-state";
import { ImageGallery } from "@/components/common/smart-image";
import { PageHeader } from "@/components/common/page-header";
import { PropertyStatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiDataSafe, apiListSafe } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session";
import { formatArea, formatCurrency, formatDate } from "@/lib/format";
import type { Favorite, PropertyDetail } from "@/lib/types/api";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await apiDataSafe<PropertyDetail>(`/properties/${id}`);

  if (!result.data) {
    return { title: "Listing not found", description: "This listing is unavailable." };
  }

  const property = result.data;
  const rooms = property.rooms ?? [];
  const images = property.images ?? [];
  const cheapest = [...rooms].sort((a, b) => a.rent - b.rent)[0];

  return {
    title: `${property.title} — ${property.city}`,
    description:
      property.description ??
      `${property.title} in ${property.city}. ${rooms.length} available room${
        rooms.length === 1 ? "" : "s"
      }${cheapest ? ` from ${formatCurrency(cheapest.rent, cheapest.currency)} per night` : ""}.`,
    alternates: { canonical: `/properties/${property.id}` },
    openGraph: {
      title: `${property.title} — ${property.city}`,
      description: property.description ?? `Available rooms at ${property.title} in ${property.city}.`,
      images: images[0] ? [{ url: images[0].url }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params;

  const [result, session] = await Promise.all([
    apiDataSafe<PropertyDetail>(`/properties/${id}`),
    getSessionUser(),
  ]);

  if (!result.data) {
    if (result.error?.toLowerCase().includes("not found")) notFound();
    return (
      <div className="container-page py-12">
        <ErrorState
          title="This listing could not be loaded"
          message={result.error ?? "The property service did not respond."}
        />
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/properties">Back to all listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const property = result.data;
  const isOwner = session?.id === property.ownerId;
  const rooms = property.rooms ?? [];
  const images = property.images ?? [];
  const amenities = property.amenities ?? [];

  const favourites = session
    ? await apiListSafe<Favorite>("/favorites", { query: { propertyId: property.id, pageSize: 1 } })
    : { items: [], error: null };
  const favourite = favourites.items[0] ?? null;

  const cheapest = [...rooms].sort((a, b) => a.rent - b.rent)[0];
  const location = [property.city, property.state, property.postalCode, property.country]
    .filter(Boolean)
    .join(", ");

  const facts = [
    { icon: Building2, label: "Type", value: "Apartment / shared home" },
    { icon: MapPin, label: "City", value: property.city },
    { icon: BedDouble, label: "Rooms available", value: String(rooms.length) },
    {
      icon: CalendarDays,
      label: "Listed",
      value: formatDate(property.publishedAt ?? property.createdAt),
    },
  ];

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Properties", href: "/properties" },
          { label: property.title },
        ]}
        title={property.title}
        description={location}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PropertyStatusBadge status={property.status} />
            {session && !isOwner ? (
              <FavoriteButton
                propertyId={property.id}
                initialFavorited={Boolean(favourite)}
                initialFavoriteId={favourite?.id ?? null}
              />
            ) : null}
            <ContactOwnerButton
              propertyId={property.id}
              ownerId={property.ownerId}
              propertyTitle={property.title}
              isAuthenticated={Boolean(session)}
              disabled={isOwner}
            />
          </div>
        }
      />

      {isOwner ? (
        <Card className="border-primary/30 bg-primary/[0.04]">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm">
              This is your listing. Manage rooms, photos and booking requests from the owner dashboard.
            </p>
            <Button asChild size="sm">
              <Link href={`/owner/listings/${property.id}`}>Manage listing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <ImageGallery images={images} alt={property.title} seed={property.id} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">About this property</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {property.description ?? "The owner has not added a description for this property yet."}
              </p>

              <Separator />

              <dl className="grid gap-4 sm:grid-cols-2">
                {facts.map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <div key={fact.label} className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          {fact.label}
                        </dt>
                        <dd className="truncate text-sm font-medium">{fact.value}</dd>
                      </div>
                    </div>
                  );
                })}
              </dl>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Address</h3>
                <address className="flex items-start gap-2 text-sm not-italic text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    {property.address}
                    <br />
                    {location}
                  </span>
                </address>
                {property.lat !== null && property.lng !== null ? (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Coordinates: {property.lat.toFixed(4)}, {property.lng.toFixed(4)}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">Amenities</h2>
              {amenities.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <li key={amenity.id}>
                      <Badge variant="secondary" className="gap-1.5">
                        <Sparkles className="size-3" aria-hidden="true" />
                        {amenity.name}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No amenities have been listed for this property.
                </p>
              )}
            </CardContent>
          </Card>

          {rooms.length > 0 ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold">Available rooms</h2>
                  {cheapest ? (
                    <p className="text-sm text-muted-foreground">
                      From{" "}
                      <span className="font-semibold text-foreground">
                        {formatCurrency(cheapest.rent, cheapest.currency)}
                      </span>{" "}
                      per night
                    </p>
                  ) : null}
                </div>

                <ul className="divide-y divide-border">
                  {rooms.map((room) => (
                    <li key={room.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{room.title}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {room.bedrooms !== null ? (
                            <span className="inline-flex items-center gap-1">
                              <BedDouble className="size-3.5" aria-hidden="true" />
                              {room.bedrooms} bed
                            </span>
                          ) : null}
                          {room.bathrooms !== null ? (
                            <span className="inline-flex items-center gap-1">
                              <Bath className="size-3.5" aria-hidden="true" />
                              {room.bathrooms} bath
                            </span>
                          ) : null}
                          {room.area !== null ? (
                            <span className="inline-flex items-center gap-1">
                              <Ruler className="size-3.5" aria-hidden="true" />
                              {formatArea(room.area)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatCurrency(room.rent, room.currency)}
                        <span className="text-xs font-normal text-muted-foreground">/night</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-2 p-6">
                <h2 className="text-lg font-semibold">Rooms</h2>
                <p className="text-sm text-muted-foreground">
                  No rooms are currently available at this property. Every room is reserved, occupied or
                  under maintenance — save it and check back later.
                </p>
              </CardContent>
            </Card>
          )}

          <SubjectReviews subject="PROPERTY" reviewableId={property.id} title={property.title} />

          {rooms.slice(0, 3).map((room) => (
            <SubjectReviews
              key={room.id}
              subject="ROOM"
              reviewableId={room.id}
              title={room.title}
              emptyHint={`Only tenants and owners with an approved booking on ${room.title} can review this room.`}
            />
          ))}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <BookingWizard
            rooms={rooms}
            isAuthenticated={Boolean(session)}
            isTenant={session?.role === "TENANT"}
            propertyId={property.id}
          />

          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <h2 className="text-base font-semibold">How booking works</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <Compass className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  Your request reserves the room while the owner reviews it.
                </li>
                <li className="flex gap-2">
                  <Compass className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  Nothing is charged until the owner approves.
                </li>
                <li className="flex gap-2">
                  <Compass className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  Approved bookings open a Stripe Checkout session for payment.
                </li>
                <li className="flex gap-2">
                  <Compass className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  Cancelling a paid booking refunds the payment automatically.
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/how-it-works">Read the full workflow</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
