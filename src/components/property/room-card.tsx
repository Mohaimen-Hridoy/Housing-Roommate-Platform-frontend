import Link from "next/link";
import { Bath, BedDouble, ChevronRight, Maximize, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/common/smart-image";
import { RoomStatusBadge } from "@/components/common/status-badge";
import { formatArea, formatCurrency, formatDate } from "@/lib/format";
import type { ImageAsset, RoomListItem } from "@/lib/types/api";

interface RoomCardProps {
  room: RoomListItem;
  image: ImageAsset | null;
}

function Spec({ icon: Icon, children }: { icon: typeof BedDouble; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary/70 px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors group-hover:bg-secondary">
      <Icon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
      {children}
    </span>
  );
}

/**
 * Browse-result card for an individual room. Links to the parent property,
 * which is where booking happens.
 */
export function RoomCard({ room, image }: RoomCardProps) {
  const property = room.property;
  const availableFrom = room.availableFrom ? formatDate(room.availableFrom) : null;

  return (
    <Link
      href={`/properties/${room.propertyId}?roomId=${room.id}#booking-card`}
      aria-label={`View ${property?.title ?? "property"} details for room ${room.title}`}
      className="interactive-surface glow-ring group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="image-zoom relative aspect-[16/10] w-full bg-muted">
        <SmartImage
          image={image}
          alt={room.title}
          seed={room.id}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="absolute left-3 top-3 z-10">
          <RoomStatusBadge status={room.status} />
        </span>
        <span
          className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {property ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">
              {property.title} · {property.city}
            </span>
          </p>
        ) : null}

        <h3 className="text-base font-semibold transition-colors group-hover:text-primary">
          {room.title}
        </h3>

        {room.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {room.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {room.bedrooms !== null ? (
            <Spec icon={BedDouble}>{room.bedrooms} bed{room.bedrooms === 1 ? "" : "s"}</Spec>
          ) : null}
          {room.bathrooms !== null ? <Spec icon={Bath}>{room.bathrooms} bath</Spec> : null}
          {room.area !== null ? (
            <Spec icon={Maximize}>{formatArea(room.area)}</Spec>
          ) : null}
        </div>

        {availableFrom ? (
          <Badge variant="outline" className="w-fit text-xs">
            Available from {availableFrom}
          </Badge>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <div>
            <p className="text-lg font-bold tabular-nums text-primary">
              {formatCurrency(room.rent, room.currency)}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            {room.deposit ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(room.deposit, room.currency)} deposit
              </p>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-transform duration-200 group-hover:translate-x-0.5">
            Details
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
