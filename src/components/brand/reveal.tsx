"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children?: React.ReactNode;
  className?: string;
  /** Seconds to wait before revealing, for staggering a group of sections. */
  delay?: number;
  /** Travel distance in pixels. Larger reads as more dramatic. */
  distance?: number;
  as?: "div" | "section" | "li" | "article" | "header";
  id?: string;
  style?: React.CSSProperties;
  role?: React.AriaRole;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * Reveals its children once when they scroll into view.
 *
 * Content is rendered in the DOM from the start, so this only animates — it
 * never gates rendering for crawlers, for users with JavaScript disabled, or
 * when `prefers-reduced-motion` is set (the animation is simply skipped).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 20,
  as: Tag = "div",
  style,
  id,
  role,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      // Start slightly before the element reaches the fold.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-revealed={shown || undefined}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out-expo motion-reduce:transition-none",
        shown ? "opacity-100" : "translate-y-[var(--reveal-distance)] opacity-0",
        className,
      )}
      style={{
        ...style,
        transitionDelay: shown && delay ? `${delay}s` : undefined,
        ["--reveal-distance" as string]: `${distance}px`,
      }}
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Tag>
  );
}