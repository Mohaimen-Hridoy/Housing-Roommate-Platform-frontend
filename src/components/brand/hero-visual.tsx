"use client";

import { CreditCard, MessageSquare, ShieldCheck, Users } from "lucide-react";

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={`relative mx-auto w-full max-w-lg lg:max-w-xl ${className ?? ""}`}>
      {/* Decorative ambient background aura */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/15 via-mint/20 to-brand/15 opacity-80 blur-2xl -z-10" />

      {/* Main Illustration Card Container */}
      <div className="surface-raised edge-light relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-muted/40 p-6 pt-16 pb-16 sm:p-8 sm:pt-20 sm:pb-20 shadow-2xl">
        {/* Background decorative concentric rings (Tuition Terminal style) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10 opacity-35" aria-hidden="true">
          <div className="size-80 rounded-full border border-primary/20" />
          <div className="absolute size-64 rounded-full border border-mint/30" />
          <div className="absolute size-48 rounded-full border border-border/40" />
        </div>

        {/* Central Vector Artwork: Housing & Roommate Platform Graphic */}
        <div className="relative mx-auto flex items-center justify-center py-4">
          <svg
            viewBox="0 0 460 340"
            className="w-full h-auto max-h-[290px] select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--brand))" />
              </linearGradient>
              <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--card))" />
                <stop offset="100%" stopColor="hsl(var(--muted))" />
              </linearGradient>
              <linearGradient id="windowGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--brand))" />
                <stop offset="100%" stopColor="hsl(var(--mint))" />
              </linearGradient>
            </defs>

            {/* Ground platform / base shadow */}
            <ellipse cx="230" cy="305" rx="190" ry="24" fill="hsl(var(--primary) / 0.08)" />
            <ellipse cx="230" cy="300" rx="160" ry="16" fill="hsl(var(--primary) / 0.12)" />

            {/* Central Modern Architectural House */}
            <rect x="145" y="110" width="170" height="175" rx="16" fill="url(#wallGrad)" stroke="hsl(var(--border))" strokeWidth="2" />

            {/* Modern Flat / Overhanging Roof with Deck */}
            <rect x="135" y="100" width="190" height="14" rx="7" fill="url(#roofGrad)" />
            <rect x="195" y="70" width="70" height="30" rx="8" fill="url(#wallGrad)" stroke="hsl(var(--border))" strokeWidth="2" />
            <rect x="185" y="64" width="90" height="8" rx="4" fill="url(#roofGrad)" />

            {/* Rooftop Window / Skylight */}
            <rect x="210" y="76" width="40" height="18" rx="4" fill="url(#windowGlow)" opacity="0.9" />

            {/* Balcony / Terrace on Left */}
            <rect x="95" y="155" width="55" height="100" rx="12" fill="url(#wallGrad)" stroke="hsl(var(--border))" strokeWidth="2" />
            <rect x="90" y="150" width="65" height="10" rx="5" fill="hsl(var(--primary))" opacity="0.85" />
            {/* Balcony Railing */}
            <rect x="95" y="215" width="55" height="40" rx="6" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
            <path d="M105 215v40M118 215v40M131 215v40M144 215v40" stroke="hsl(var(--border))" strokeWidth="1.5" />

            {/* Side Garden Tree */}
            <circle cx="85" cy="275" r="22" fill="hsl(var(--mint) / 0.6)" />
            <circle cx="75" cy="265" r="18" fill="hsl(var(--mint) / 0.8)" />
            <circle cx="95" cy="262" r="16" fill="hsl(var(--primary) / 0.4)" />
            <rect x="82" y="285" width="6" height="22" rx="3" fill="hsl(var(--brand))" />

            {/* Right Wing Room */}
            <rect x="310" y="170" width="60" height="115" rx="12" fill="url(#wallGrad)" stroke="hsl(var(--border))" strokeWidth="2" />
            <rect x="305" y="164" width="70" height="10" rx="5" fill="hsl(var(--primary))" opacity="0.85" />

            {/* Large Picture Windows with Warm Glowing Interior Light */}
            <rect x="160" y="130" width="60" height="50" rx="8" fill="url(#windowGlow)" opacity="0.95" />
            <path d="M190 130v50M160 155h60" stroke="hsl(var(--card))" strokeWidth="2" />

            <rect x="240" y="130" width="60" height="50" rx="8" fill="url(#windowGlow)" opacity="0.85" />
            <path d="M270 130v50M240 155h60" stroke="hsl(var(--card))" strokeWidth="2" />

            {/* Main Entrance Door with Arch */}
            <rect x="205" y="215" width="50" height="70" rx="10" fill="hsl(var(--primary))" />
            <rect x="210" y="220" width="40" height="65" rx="8" fill="url(#roofGrad)" />
            <circle cx="242" cy="255" r="3.5" fill="white" />

            {/* Welcoming Steps */}
            <rect x="195" y="283" width="70" height="6" rx="3" fill="hsl(var(--border))" />
            <rect x="185" y="289" width="90" height="7" rx="3.5" fill="hsl(var(--border))" />

            {/* Connecting Roommate Match Bridge (Illustrating roommate matchmaking) */}
            <g className="animate-pulse">
              <path
                d="M80 120 C 130 50, 330 50, 380 120"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />
              <circle cx="230" cy="62" r="14" fill="hsl(var(--primary))" />
              <path d="M225 62l3.5 3.5 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Tenant 1 Node (Left) */}
            <g transform="translate(60, 95)">
              <circle cx="20" cy="20" r="18" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
              <circle cx="20" cy="14" r="7" fill="hsl(var(--primary))" />
              <path d="M9 29c0-6 5-9 11-9s11 3 11 9" fill="hsl(var(--primary))" />
            </g>

            {/* Roommate 2 Node (Right) */}
            <g transform="translate(360, 95)">
              <circle cx="20" cy="20" r="18" fill="hsl(var(--card))" stroke="hsl(var(--brand))" strokeWidth="2" />
              <circle cx="20" cy="14" r="7" fill="hsl(var(--brand))" />
              <path d="M9 29c0-6 5-9 11-9s11 3 11 9" fill="hsl(var(--brand))" />
            </g>
          </svg>
        </div>

        {/* 4 Tuition-Terminal Style Floating Benefit / Feature Cards */}
        {/* Card 1: Top-Left - Roommate Match */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card/95 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:border-primary/50 animate-float">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Users className="size-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Roommate Match</p>
            <p className="text-[11px] font-medium text-muted-foreground">Smart Compatibility</p>
          </div>
        </div>

        {/* Card 2: Top-Right - 100% Verified */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card/95 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:border-primary/50 animate-float-gentle">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">100% Verified</p>
            <p className="text-[11px] font-medium text-muted-foreground">Real Spaces & Owners</p>
          </div>
        </div>

        {/* Card 3: Bottom-Left - Stripe Escrow */}
        <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card/95 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:border-primary/50 animate-float-gentle">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
            <CreditCard className="size-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Stripe Escrow</p>
            <p className="text-[11px] font-medium text-muted-foreground">Secure Payments</p>
          </div>
        </div>

        {/* Card 4: Bottom-Right - Direct Owner Chat */}
        <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card/95 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:border-primary/50 animate-float">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
            <MessageSquare className="size-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Direct Chat</p>
            <p className="text-[11px] font-medium text-muted-foreground">Zero Broker Fees</p>
          </div>
        </div>
      </div>
    </div>
  );
}
