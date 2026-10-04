"use client";

import { Heart, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { apiClient, errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  propertyId: string;
  /** Initial state resolved on the server, so there is no layout flicker. */
  initialFavoriteId?: string | null;
  initialFavorited: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

/**
 * Optimistic favourite toggle. The UI flips immediately and rolls back if the
 * API rejects the change, then shows a toast either way.
 */
export function FavoriteButton({
  propertyId,
  initialFavoriteId,
  initialFavorited,
  variant = "outline",
  size = "default",
  showLabel = true,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteId, setFavoriteId] = useState<string | null>(initialFavoriteId ?? null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const previous = { favorited, favoriteId };
    const next = !favorited;

    setFavorited(next);
    if (next) setFavoriteId(null);

    startTransition(async () => {
      try {
        if (next) {
          const result = await apiClient<{ id: string }>("/favorites", {
            method: "POST",
            body: { propertyId },
          });
          setFavoriteId(result.data.id);
          toast.success("Saved to your favourites");
        } else {
          const target = favoriteId;
          if (!target) {
            setFavorited(previous.favorited);
            return;
          }
          await apiClient(`/favorites/${target}`, { method: "DELETE" });
          setFavoriteId(null);
          toast.success("Removed from your favourites");
        }
      } catch (error) {
        setFavorited(previous.favorited);
        setFavoriteId(previous.favoriteId);
        toast.error("Could not update favourites", { description: errorMessage(error) });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favourites" : "Save to favourites"}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60",
        favorited
          ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
          : "border-input bg-background hover:bg-secondary hover:text-secondary-foreground",
        size === "sm" && "h-9 px-3 text-xs",
        size === "lg" && "h-12 px-6 text-base",
        size === "icon" && "size-10 px-0",
        variant === "ghost" && "border-transparent bg-transparent",
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Heart className={cn("size-4", favorited && "fill-current")} aria-hidden="true" />
      )}
      {showLabel && size !== "icon" ? (favorited ? "Saved" : "Save") : null}
      <span className="sr-only">{favorited ? "Remove from favourites" : "Save to favourites"}</span>
    </button>
  );
}
