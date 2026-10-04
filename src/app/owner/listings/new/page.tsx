import type { Metadata } from "next";
import Link from "next/link";

import { ListingWizard } from "@/components/dashboard/owner/listing-wizard";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { apiListSafe } from "@/lib/api/server";
import type { Amenity } from "@/lib/types/api";

export const metadata: Metadata = {
  title: "New listing",
  description: "Create a property in four guided steps: basics, location, amenities and publishing.",
  robots: { index: false, follow: false },
};

export default async function NewListingPage() {
  const amenities = await apiListSafe<Amenity>("/amenities", {
    query: { pageSize: 100, sortBy: "name", sortOrder: "asc" },
  });

  return (
    <>
      <PageHeader
        eyebrow="Listings"
        title="Create a new listing"
        description="Four short steps. Each step validates before you continue, and nothing is sent to the API until you confirm on the last step."
        breadcrumbs={[
          { label: "Owner dashboard", href: "/owner" },
          { label: "Listings", href: "/owner/listings" },
          { label: "New listing" },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link href="/owner/listings">Cancel</Link>
          </Button>
        }
      />

      {amenities.error ? (
        <ErrorState
          title="Amenity catalogue unavailable"
          message={`${amenities.error} You can still create the listing and attach amenities later.`}
        />
      ) : null}

      <ListingWizard allAmenities={amenities.items} />
    </>
  );
}