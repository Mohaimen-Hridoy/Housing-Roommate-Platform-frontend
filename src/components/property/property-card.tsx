import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
  const shownAmenities = amenities.slice(0, 4);
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
      className="interactive-surface group block overflow-hidden rounded-2xl border border-border bg-card text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] w-full bg-muted">
        <SmartImage
          image={image}
          alt={property.title}
          seed={property.id}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
        <span className="absolute left-3 top-3 z-10">
          <PropertyStatusBadge status={property.status} />
        </span>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-base font-semibold group-hover:text-primary">{property.title}</h3>

        <p className="text-sm text-muted-foreground line-clamp-1">{location}</p>

        {rentRoom ? (
          <p className="text-base font-semibold tabular-nums text-primary">
            From {formatCurrency(rentRoom.rent, rentRoom.currency)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </p>
        ) : null}

        {amenities.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {shownAmenities.map((amenity) => (
              <Badge key={amenity.id} variant="outline" className="text-xs">
                {amenity.name}
              </Badge>
            ))}
            {hiddenAmenityCount > 0 ? (
              <Badge variant="secondary" className="text-xs">
                +{hiddenAmenityCount} more
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-1">
          {roomCount ? (
            <span className="text-xs text-muted-foreground">{pluralize(roomCount, "room")}</span>
          ) : null}
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline",
              roomCount ? "" : "justify-end",
            )}
          >
            View details
            <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
