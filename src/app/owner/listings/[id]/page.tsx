import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PropertyManager } from "@/components/dashboard/owner/property-manager";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { PropertyStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { apiDataSafe, apiListSafe } from "@/lib/api/server";
import { formatDate } from "@/lib/format";
import type { Amenity, ImageAsset, PropertyDetail, RoomListItem } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "Manage listing",
  description: "Manage the rooms, photos, amenities and publishing status of one of your properties.",
  robots: { index: false, follow: false },
};

interface ManageListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageListingPage({ params }: ManageListingPageProps) {
  const { id } = await params;

  const [property, roomList, imageList, amenityList] = await Promise.all([
    apiDataSafe<PropertyDetail>(`/properties/${id}`),
    // `GET /properties/:id` only returns AVAILABLE rooms, so inventory comes from the rooms endpoint.
    apiListSafe<RoomListItem>(`/properties/${id}/rooms`, {
      query: { pageSize: 100, sortBy: "createdAt", sortOrder: "asc" },
    }),
    apiDataSafe<ImageAsset[]>(`/properties/${id}/images`),
    apiListSafe<Amenity>("/amenities", { query: { pageSize: 100, sortBy: "name", sortOrder: "asc" } }),
  ]);

  if (!property.data) {
    return (
      <>
        <PageHeader
          eyebrow="Listings"
          title="Listing unavailable"
          breadcrumbs={[
            { label: "Owner dashboard", href: "/owner" },
            { label: "Listings", href: "/owner/listings" },
            { label: "Unavailable" },
          ]}
          actions={
            <Button asChild variant="outline">
              <Link href="/owner/listings">
                <ArrowLeft />
                Back to listings
              </Link>
            </Button>
          }
        />
        <ErrorState
          title="Property not found"
          message={property.error ?? "This property does not exist, or it has been deleted."}
        />
      </>
    );
  }

  const detail = property.data;
  const rooms = roomList.items;

  return (
    <>
      <PageHeader
        eyebrow="Listings"
        title={detail.title}
        description={[detail.address, detail.city, detail.state, detail.country].filter(Boolean).join(", ")}
        breadcrumbs={[
          { label: "Owner dashboard", href: "/owner" },
          { label: "Listings", href: "/owner/listings" },
          { label: detail.title },
        ]}
        actions={
          <>
            <PropertyStatusBadge status={detail.status} />
            {detail.status === "PUBLISHED" ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/properties/${detail.id}`} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  View public page
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      {property.error ? <ErrorState title="Some data could not be loaded" message={property.error} /> : null}
      {roomList.error ? <ErrorState title="Room inventory unavailable" message={roomList.error} /> : null}
      {imageList.error ? <ErrorState title="Photos unavailable" message={imageList.error} /> : null}
      {amenityList.error ? (
        <ErrorState
          title="Amenity catalogue unavailable"
          message={`${amenityList.error} You can still edit everything else on this page.`}
        />
      ) : null}

      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Created</dt>
            <dd className="font-medium">{formatDate(detail.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Published</dt>
            <dd className="font-medium">{formatDate(detail.publishedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Postal code</dt>
            <dd className="font-medium">{detail.postalCode ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Coordinates</dt>
            <dd className="font-medium">
              {detail.lat !== null && detail.lng !== null ? `${detail.lat}, ${detail.lng}` : "Not provided"}
            </dd>
          </div>
        </dl>
      </div>

      <PropertyManager property={detail} rooms={rooms} images={imageList.data ?? []} allAmenities={amenityList.items} />
    </>
  );
}
