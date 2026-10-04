import type { Metadata } from "next";

import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { PageHeader } from "@/components/common/page-header";
import { apiListSafe } from "@/lib/api/server";
import type { Favorite } from "@/lib/types/api";

import { FavoriteGrid } from "@/components/dashboard/tenant/favorite-grid";

export const metadata: Metadata = {
  title: "Favourites",
  description: "The properties you saved, ready to compare and book.",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TenantFavoritesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = one(params.page);
  const pageSize = one(params.pageSize);

  const result = await apiListSafe<Favorite>("/favorites", { query: { page, pageSize } });

  return (
    <>
      <PageHeader
        eyebrow="Tenant dashboard"
        title="Favourites"
        description="Properties you saved. Removing one only clears it from your account — the listing stays live."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Favourites" }]}
      />

      {result.error ? (
        <ErrorState title="Favourites could not be loaded" message={result.error} />
      ) : (
        <>
          <FavoriteGrid initialFavorites={result.items} />
          <Pagination meta={result.pagination} />
        </>
      )}
    </>
  );
}