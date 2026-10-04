"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Adds the lift-on-hover behaviour on top of the highlight. */
  interactive?: boolean;
}

/**
 * Card with a highlight that follows the pointer.
 *
 * The pointer position is written to two CSS custom properties and the gradient
 * itself is CSS, so moving the mouse never triggers a React render — only two
 * style-property writes per pointer event.
 */
export function SpotlightCard({
  children,
  className,
  interactive = true,
  onPointerMove,
  onPointerLeave,
  ...props
}: SpotlightCardProps) {
  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty(
        "--spot-x",
        `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
      );
      event.currentTarget.style.setProperty(
        "--spot-y",
        `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
      );
      onPointerMove?.(event);
    },
    [onPointerMove],
  );

  const handlePointerLeave = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.style.setProperty("--spot-x", "50%");
      event.currentTarget.style.setProperty("--spot-y", "50%");
      onPointerLeave?.(event);
    },
    [onPointerLeave],
  );

  return (
    <div
      className={cn(
        "surface spotlight relative isolate overflow-hidden",
        interactive && "interactive-surface",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </div>
  );
}
