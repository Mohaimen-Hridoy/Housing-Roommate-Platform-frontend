import Image from "next/image";
import { CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";

interface AuthVisualPanelProps {
  quote?: string;
  authorName?: string;
  authorRole?: string;
}

export function AuthVisualPanel({
  quote = "Finding a verified apartment in Dhaka used to be stressful. NestSpace made it seamless — zero broker fees, verified listings, and direct landlord contact.",
  authorName = "Farhan Rahman",
  authorRole = "Verified Tenant · Gulshan, Dhaka",
}: AuthVisualPanelProps) {
  return (
    <div className="relative hidden lg:flex h-full min-h-[580px] flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-8 shadow-2xl">
      {/* Background high-res architecture photo */}
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
        alt="Modern luxury interior apartment"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
        className="object-cover"
      />

      {/* Deep gradient vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />

      {/* Top brand trust chips */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <Sparkles className="size-3 text-amber-400" />
          Trusted by 10,000+ Renters
        </span>

        <span className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
          <ShieldCheck className="size-3.5" />
          100% Verified
        </span>
      </div>

      {/* Bottom testimonial card & feature badges */}
      <div className="relative z-10 space-y-5 text-white">
        {/* Star rating */}
        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-4 fill-amber-400" aria-hidden="true" />
          ))}
          <span className="ml-1 text-xs font-semibold text-white/90">4.9 / 5 Overall Rating</span>
        </div>

        {/* Quote */}
        <blockquote className="text-base sm:text-lg font-medium leading-relaxed text-white/95 drop-shadow-sm">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Author info */}
        <div className="flex items-center gap-3 border-t border-white/20 pt-4">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt={authorName}
            width={40}
            height={40}
            className="size-10 rounded-full border border-white/40 object-cover"
          />
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold text-white">
              {authorName}
              <CheckCircle2 className="size-3.5 text-emerald-400" />
            </p>
            <p className="text-xs font-medium text-white/95 drop-shadow-sm">{authorRole}</p>
          </div>
        </div>

        {/* Trust bullet pills */}
        <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium text-white">
          <span className="rounded-md border border-white/20 bg-black/40 px-2.5 py-1 backdrop-blur-md drop-shadow-sm">⚡ Instant Booking</span>
          <span className="rounded-md border border-white/20 bg-black/40 px-2.5 py-1 backdrop-blur-md drop-shadow-sm">🔒 Stripe Escrow</span>
          <span className="rounded-md border border-white/20 bg-black/40 px-2.5 py-1 backdrop-blur-md drop-shadow-sm">🚫 Zero Broker Markup</span>
        </div>
      </div>
    </div>
  );
}

