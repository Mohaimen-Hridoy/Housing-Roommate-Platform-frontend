"use client";

import * as React from "react";

import { Reveal } from "@/components/brand/reveal";

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
          // Cap the cascade so a long page does not leave the last section
          // feeling sluggish.
          delay={Math.min(index, 6) * step}
        >
          {child}
        </Reveal>
      ))}
    </div>
  );
}
