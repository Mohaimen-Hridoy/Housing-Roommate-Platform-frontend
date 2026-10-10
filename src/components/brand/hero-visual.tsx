import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck, Star, Zap } from "lucide-react";
import type { PropertyListItem } from "@/lib/types/api";
import { formatCurrency } from "@/lib/format";

interface HeroVisualProps {
  className?: string;
  property?: PropertyListItem | null;
  imageUrl?: string | null;
}

export function HeroVisual({ className, property, imageUrl }: HeroVisualProps) {
  const title = property?.title ?? "Skyline Terrace Suite";
  const location = property
    ? `${property.city}${property.state ? `, ${property.state}` : ""}`
    : "Gulshan 2, Dhaka";
  const href = property ? `/properties/${property.id}` : "/properties";
  const imageSrc =
    imageUrl ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85";
  const priceDisplay = property?.rooms?.[0]?.rent
    ? formatCurrency(property.rooms[0].rent, property.rooms[0].currency)
    : "৳24,500";

  return (
    <div className={`relative mx-auto w-full max-w-lg lg:max-w-none ${className ?? ""}`}>
      {/* Decorative ambient aura behind the hero card */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-mint/20 to-brand/20 opacity-70 blur-2xl -z-10" />

      {/* Main featured property showcase card (Clickable Link!) */}
      <Link
        href={href}
        className="group block surface-raised edge-light relative overflow-hidden rounded-3xl border border-border/80 bg-card p-3 shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-15px_hsl(var(--shadow-color)/0.35)]"
      >
        {/* Main image container */}
        <div className="image-zoom relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradient vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          {/* Top badges bar */}
          <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Verified Space
            </span>

            <span className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-transform group-hover:scale-110">
              <ArrowUpRight className="size-4 text-white" />
            </span>
          </div>

          {/* Bottom info inside the hero image */}
          <div className="absolute inset-x-4 bottom-4 text-white">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  <MapPin className="size-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{location}</span>
                </p>
                <h3 className="mt-0.5 text-lg font-bold tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] sm:text-xl truncate group-hover:text-emerald-300 transition-colors">
                  {title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold tracking-tight text-white tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] sm:text-2xl">
                  {priceDisplay}
                  <span className="ml-1 text-xs font-normal text-white/90">/mo</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card footer specs row */}
        <div className="flex items-center justify-between px-3 py-3 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              {property?.amenities && property.amenities.length > 0
                ? `${property.amenities.length} Amenities`
                : "2 Bed · 2 Bath"}
            </span>
            <span>·</span>
            <span className="text-foreground font-semibold">Live Listing</span>
          </div>
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Zap className="size-3.5 text-amber-500" />
            Instant move-in
          </span>
        </div>
      </Link>

      {/* Floating Badge 1: Top-Right Review Card */}
      <div className="absolute -top-5 -right-3 hidden sm:flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur-xl animate-float">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
          <Star className="size-5 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">4.9 / 5.0</span>
            <span className="text-xs font-medium text-muted-foreground">(Verified)</span>
          </div>
          <p className="text-xs font-semibold text-primary">Top Rated Spaces</p>
        </div>
      </div>

      {/* Floating Badge 2: Bottom-Left Stripe Escrow Badge */}
      <div className="absolute -bottom-6 -left-4 hidden sm:flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-xl animate-float-gentle">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Stripe Secure Escrow</p>
          <p className="text-[11px] font-medium text-muted-foreground">100% Protected Payment</p>
        </div>
      </div>
    </div>
  );
}
