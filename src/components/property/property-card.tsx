import Link from "next/link";
import { ChevronRight, Heart, MapPin, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/common/smart-image";
import { PropertyStatusBadge } from "@/components/common/status-badge";
import { formatCurrency } from "@/lib/format";
import { cn, pluralize } from "@/lib/utils";
import type { ImageAsset, PropertyListItem, RoomSummary } from "@/lib/types/api";

interface PropertyCardProps {
  property: PropertyListItem;
  image: ImageAsset | null;
}

function cheapestRoom(rooms: RoomSummary[] | undefined | null): RoomSummary | undefined {
  if (!rooms?.length) return undefined;
  return rooms.reduce((cheapest, room) => (room.rent < cheapest.rent ? room : cheapest));
}

export function PropertyCard({ property, image }: PropertyCardProps) {
  const rentRoom = cheapestRoom(property.rooms);
  const amenities = property.amenities ?? [];
  const shownAmenities = amenities.slice(0, 3);
  const hiddenAmenityCount = amenities.length - shownAmenities.length;
  const roomCount = property.rooms?.length;

  const locationLine = property.state
    ? `${property.city}, ${property.state}`
    : property.city;
  const location = property.country ? `${locationLine} · ${property.country}` : locationLine;

  return (
    <Link
      href={`/properties/${property.id}`}
      aria-label={`View ${property.title} details`}
      className="interactive-surface glow-ring group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xs transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* High-quality image showcase with floating badges */}
      <div className="image-zoom relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <SmartImage
          image={image}
          alt={property.title}
          seed={property.id}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />

        {/* Ambient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

        {/* Top badges bar */}
        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
          <span className="backdrop-blur-md">
            <PropertyStatusBadge status={property.status} />
          </span>

          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:text-rose-400"
          >
            <Heart className="size-4" />
          </span>
        </div>

        {/* Bottom image overlay with location & photo count indicator */}
        <div className="absolute inset-x-3 bottom-2.5 z-10 flex items-center justify-between text-white">
          <p className="flex items-center gap-1 text-xs font-medium drop-shadow-sm">
            <MapPin className="size-3 text-emerald-400" aria-hidden="true" />
            <span className="truncate max-w-[160px]">{property.city}</span>
          </p>

          <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[0.625rem] font-medium backdrop-blur-md">
            <Sparkles className="size-2.5 text-amber-400" />
            Verified
          </span>
        </div>
      </div>

      {/* Content body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
            {property.title}
          </h3>

          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{location}</p>
        </div>

        {/* Price & availability */}
        {rentRoom ? (
          <div>
            <p className="text-lg font-bold tabular-nums text-primary">
              From {formatCurrency(rentRoom.rent, rentRoom.currency)}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">/mo</span>
            </p>
          </div>
        ) : null}

        {/* Amenities pills */}
        {amenities.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {shownAmenities.map((amenity) => (
              <Badge key={amenity.id} variant="secondary" className="text-[0.6875rem] font-medium px-2 py-0.5">
                {amenity.name}
              </Badge>
            ))}
            {hiddenAmenityCount > 0 ? (
              <span className="text-[0.6875rem] text-muted-foreground font-medium">
                +{hiddenAmenityCount}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Card footer row */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          {roomCount ? (
            <span className="font-medium">{pluralize(roomCount, "available room")}</span>
          ) : (
            <span />
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 font-semibold text-primary transition-transform duration-200 group-hover:translate-x-0.5",
              roomCount ? "" : "ml-auto",
            )}
          >
            View details
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
