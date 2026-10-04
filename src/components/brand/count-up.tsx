"use client";

import * as React from "react";

interface CountUpProps {
  /** Final value. Rendered verbatim when it is not a finite number. */
  value: number;
  /** Optional decimals — 3 shows as "3", 3.5 as "3.5". */
  decimals?: number;
  /** Milliseconds the count takes to reach `value`. */
  duration?: number;
  className?: string;
  /** Rendered until the first frame, so the layout never collapses. */
  fallback?: string;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Counts from zero to `value` the first time it scrolls into view.
 *
 * The final value is what assistive technology and search engines receive: the
 * element is only ever visually transient, and it is written straight to the
 * DOM inside `requestAnimationFrame` so no frame schedules a React render.
 * `prefers-reduced-motion` skips straight to the end.
 */
export function CountUp({
  value,
  decimals,
  duration = 1400,
  className,
  fallback,
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [done, setDone] = React.useState(false);

  const places = decimals ?? (Number.isInteger(value) ? 0 : 2);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || done) return;

    if (!Number.isFinite(value)) {
      setDone(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = value.toFixed(places);
      setDone(true);
      return;
    }

    let frame = 0;

    const run = () => {
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        node.textContent = (value * easeOutExpo(progress)).toFixed(places);
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setDone(true);
        }
      };
      frame = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, places, done]);

  return (
    <span ref={ref} className={className}>
      {fallback ?? value.toFixed(places)}
    </span>
  );
}
