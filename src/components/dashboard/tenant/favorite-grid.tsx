"use client";

import { Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { SmartImage } from "@/components/common/smart-image";
import { PropertyStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient, errorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import type { Favorite } from "@/lib/types/api";

/** Grid of favourited properties with an optimistic remove. */
export function FavoriteGrid({ initialFavorites }: { initialFavorites: Favorite[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [confirming, setConfirming] = useState<Favorite | null>(null);
  const [busy, setBusy] = useState(false);

  const remove = async (favorite: Favorite) => {
    setBusy(true);
    setFavorites((current) => current.filter((entry) => entry.id !== favorite.id));
    try {
      const result = await apiClient(`/favorites/${favorite.id}`, { method: "DELETE" });
      toast.success(result.message || "Removed from favourites", { description: favorite.property.title });
      setConfirming(null);
    } catch (error) {
      setFavorites((current) =>
        current.some((entry) => entry.id === favorite.id) ? current : [favorite, ...current],
      );
      toast.error("Could not remove this favourite", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          description="Save the properties you like and compare them side by side before you request a booking."
          action={{ label: "Browse properties", href: "/properties" }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="flex h-full flex-col overflow-hidden">
              <Link href={`/properties/${favorite.propertyId}`} className="relative block aspect-[16/10] bg-muted">
                <SmartImage
                  seed={favorite.propertyId}
                  alt={favorite.property?.title ?? "Saved Property"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                {favorite.property?.status ? (
                  <span className="absolute left-3 top-3">
                    <PropertyStatusBadge status={favorite.property.status} />
                  </span>
                ) : null}
              </Link>

              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="space-y-1">
                  <h3 className="truncate font-semibold">
                    <Link href={`/properties/${favorite.propertyId}`} className="hover:text-primary">
                      {favorite.property?.title ?? "Saved Property"}
                    </Link>
                  </h3>
                  {favorite.property?.city ? (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {favorite.property.city}
                    </p>
                  ) : null}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">Saved {formatDate(favorite.createdAt)}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirming(favorite)}
                  >
                    <Heart className="fill-destructive text-destructive" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open) setConfirming(null);
        }}
        title="Remove from favourites?"
        description={`${confirming?.property.title ?? "This property"} will no longer be saved on your account.`}
        confirmLabel="Remove"
        destructive
        loading={busy}
        onConfirm={() => {
          if (confirming) return remove(confirming);
        }}
      />
    </>
  );
}