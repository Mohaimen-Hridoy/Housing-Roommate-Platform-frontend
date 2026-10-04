import type { CSSProperties } from "react";

/**
 * Hero artwork for the marketing pages.
 *
 * Hand-built SVG rather than a stock illustration: it reuses the brand tokens,
 * so it re-colours correctly in dark mode and needs no network request. Kept
 * decorative and `aria-hidden` — the surrounding copy carries the meaning.
 */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 460"
      fill="none"
      aria-hidden="true"
      className={className}
      role="presentation"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.16)" />
          <stop offset="55%" stopColor="hsl(var(--brand) / 0.14)" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.05)" />
        </linearGradient>
        <linearGradient id="facade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--card))" />
          <stop offset="100%" stopColor="hsl(var(--muted))" />
        </linearGradient>
        <linearGradient id="warmGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand))" />
          <stop offset="100%" stopColor="hsl(var(--brand) / 0.55)" />
        </linearGradient>
        <linearGradient id="primaryFade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.72)" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <rect x="20" y="16" width="480" height="428" rx="34" fill="url(#sky)" />
      <g className="animate-float-slow" style={{ transformOrigin: "404px 98px" }}>
        <circle cx="404" cy="98" r="46" fill="hsl(var(--brand) / 0.18)" />
        <circle cx="404" cy="98" r="26" fill="hsl(var(--brand) / 0.32)" />
      </g>

      {/* building */}
      <rect x="92" y="132" width="212" height="252" rx="20" fill="url(#facade)" stroke="hsl(var(--border))" />
      <path d="M92 178h212" stroke="hsl(var(--border))" />
      <path d="M92 244h212" stroke="hsl(var(--border))" />
      <path d="M92 310h212" stroke="hsl(var(--border))" />
      <path d="M162 132v252" stroke="hsl(var(--border))" />
      <path d="M234 132v252" stroke="hsl(var(--border))" />

      {/* lit windows: warm interior light */}
      <rect x="106" y="146" width="42" height="20" rx="6" fill="url(#warmGlow)" />
      <rect x="176" y="146" width="42" height="20" rx="6" fill="hsl(var(--border))" />
      <rect x="248" y="146" width="42" height="20" rx="6" fill="hsl(var(--border))" />

      <rect x="106" y="212" width="42" height="20" rx="6" fill="hsl(var(--border))" />
      <rect x="176" y="212" width="42" height="20" rx="6" fill="url(#warmGlow)" />
      <rect x="248" y="212" width="42" height="20" rx="6" fill="url(#primaryFade)" />

      <rect x="106" y="278" width="42" height="20" rx="6" fill="url(#primaryFade)" />
      <rect x="176" y="278" width="42" height="20" rx="6" fill="hsl(var(--border))" />
      <rect x="248" y="278" width="42" height="20" rx="6" fill="url(#warmGlow)" />

      {/* entrance */}
      <path
        d="M176 384v-52a20 20 0 0 1 40 0v52"
        fill="url(#primaryFade)"
      />
      <circle cx="208" cy="358" r="3.4" fill="hsl(var(--primary-foreground))" opacity="0.9" />

      {/* plant */}
      <path d="M352 384c0-30 8-52 26-64-2 30-10 50-26 64Z" fill="hsl(var(--primary) / 0.75)" />
      <path d="M352 384c-2-26-14-44-32-52 4 26 14 44 32 52Z" fill="hsl(var(--primary) / 0.5)" />
      <path d="M330 384h44l-6 40h-32l-6-40Z" fill="hsl(var(--brand) / 0.85)" />

      {/* floating booking card */}
      <g className="animate-float" style={{ transformOrigin: "398px 232px" }}>
        <rect
          x="316"
          y="176"
          width="164"
          height="112"
          rx="18"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
        />
        <rect x="332" y="192" width="132" height="44" rx="10" fill="hsl(var(--muted))" />
        <path
          d="M346 224l14-11 11 8 14-13 13 10 14-12 18 18"
          stroke="hsl(var(--primary))"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ "--draw-length": 130 } as CSSProperties}
          className="animate-draw"
        />
        <rect x="332" y="248" width="66" height="8" rx="4" fill="hsl(var(--muted))" />
        <rect x="332" y="264" width="96" height="8" rx="4" fill="hsl(var(--muted))" />
        <rect x="424" y="246" width="40" height="22" rx="8" fill="url(#primaryFade)" />
      </g>

      {/* verified badge */}
      <g
        className="animate-float-slow"
        style={{ transformOrigin: "134px 211px", animationDelay: "-3s" }}
      >
        <rect x="70" y="188" width="128" height="46" rx="16" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
        <circle cx="94" cy="211" r="11" fill="hsl(var(--primary))" />
        <path
          d="m89.5 211 3.2 3.4 6-6.6"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="112" y="204" width="70" height="7" rx="3.5" fill="hsl(var(--muted))" />
        <rect x="112" y="217" width="48" height="6" rx="3" fill="hsl(var(--muted))" />
      </g>
    </svg>
  );
}