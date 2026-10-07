import Image from "next/image";
import { Heart, MapPin, Star, Zap } from "lucide-react";

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={`relative mx-auto w-full max-w-lg lg:max-w-none ${className ?? ""}`}>
      {/* Decorative ambient aura behind the hero cards */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-mint/20 to-brand/20 opacity-70 blur-2xl -z-10" />

      {/* Main featured property showcase card */}
      <div className="surface-raised edge-light relative overflow-hidden rounded-3xl border border-border/80 bg-card p-3 shadow-2xl transition-all duration-500 hover:shadow-[0_30px_60px_-15px_hsl(var(--shadow-color)/0.35)]">
        {/* Main image container */}
        <div className="image-zoom relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
            alt="Modern luxury apartment with living room and balcony"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />

          {/* Gradient vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          {/* Top badges bar */}
          <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Verified Space
            </span>

            <span className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-transform hover:scale-110">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
            </span>
          </div>

          {/* Bottom info inside the hero image */}
          <div className="absolute inset-x-4 bottom-4 text-white">
            <div className="flex items-end justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <MapPin className="size-3.5 text-emerald-400" />
                  Gulshan 2, Dhaka
                </p>
                <h3 className="mt-0.5 text-lg font-bold tracking-tight text-white sm:text-xl">
                  Skyline Terrace Suite
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold tracking-tight text-white tabular-nums sm:text-2xl">
                  ৳24,500
                  <span className="text-xs font-normal text-white/80">/mo</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card footer specs row */}
        <div className="flex items-center justify-between px-3 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>2 Bed · 2 Bath</span>
            <span>·</span>
            <span>1,150 sqft</span>
          </div>
          <span className="flex items-center gap-1 font-medium text-primary">
            <Zap className="size-3.5 text-amber-500" />
            Fast move-in
          </span>
        </div>
      </div>

      {/* Floating Badge 1: Top-Right Review Card */}
      <div className="absolute -top-5 -right-3 hidden sm:flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur-xl animate-float">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
          <Star className="size-5 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">4.9</span>
            <span className="text-xs text-muted-foreground">(1,240+ reviews)</span>
          </div>
          <p className="text-[0.6875rem] font-medium text-primary">Superhost Approved</p>
        </div>
      </div>

      {/* Floating Badge 2: Bottom-Left Tenant Avatar Stack */}
      <div className="absolute -bottom-6 -left-4 hidden sm:flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-xl animate-float-gentle">
        <div className="flex -space-x-2 overflow-hidden">
          <Image
            className="inline-block size-8 rounded-full ring-2 ring-card object-cover"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="Tenant avatar"
            width={32}
            height={32}
          />
          <Image
            className="inline-block size-8 rounded-full ring-2 ring-card object-cover"
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
            alt="Tenant avatar"
            width={32}
            height={32}
          />
          <Image
            className="inline-block size-8 rounded-full ring-2 ring-card object-cover"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
            alt="Tenant avatar"
            width={32}
            height={32}
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">3,800+ Roommates</p>
          <p className="text-[0.6875rem] text-muted-foreground">Connected this month</p>
        </div>
      </div>
    </div>
  );
}
