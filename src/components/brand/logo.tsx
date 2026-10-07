/**
 * NestSpace mark: a doorway under a roof, with a shared-room window.
 * Drawn as strokes so it inherits `currentColor` at every size.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="NestSpace"
      className={className}
    >
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M7.5 14.2 16 7.6l8.5 6.6"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 13.4v9.2a1 1 0 0 0 1 1h9.6a1 1 0 0 0 1-1v-9.2"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.9 23.6v-4.3a2.1 2.1 0 0 1 4.2 0v4.3"
        stroke="hsl(var(--brand))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Full lockup used in the header and footer. */
export function LogoLockup({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  if (!showWordmark) {
    return <LogoMark className={className} />;
  }

  return (
    <span className={className}>
      <LogoMark className="size-8 shrink-0 text-primary" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Nest<span className="text-primary">Space</span>
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Homes&nbsp;&amp;&nbsp;rooms
        </span>
      </span>
    </span>
  );
}