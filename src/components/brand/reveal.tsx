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
  as?: "div" | "section" | "li" | "article" | "header" | "tr";
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

interface RevealGroupProps {
  children?: React.ReactNode;
  className?: string;
  /** Seconds added per child, so sections cascade instead of popping together. */
  step?: number;
  /** Travel distance for each child. */
  distance?: number;
}

/**
 * Reveals each direct child in turn as the group scrolls into view.
 *
 * Wrapping a page's sections in one of these is cheaper and far less noisy than
 * hand-placing a `Reveal` per section, and it keeps the stagger in sync with the
 * child order automatically.
 */
export function RevealGroup({
  children,
  className,
  step = 0.07,
  distance = 20,
}: RevealGroupProps) {
  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => (
        <Reveal
          key={React.isValidElement(child) && child.key != null ? child.key : index}
          distance={distance}
          delay={Math.min(index, 6) * step}
        >
          {child}
        </Reveal>
      ))}
    </div>
  );
}