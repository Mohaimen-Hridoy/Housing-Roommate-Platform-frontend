"use client";

import type { ReactNode } from "react";

import { useTranslation } from "@/components/providers/locale-provider";

interface TProps {
  /** Dictionary key, e.g. `auth.signInTitle`. */
  k: string;
  /** Interpolation values for `{{name}}` placeholders. */
  vars?: Record<string, string | number>;
  /**
   * English text used when the active locale has no entry for `k`. Without it a
   * missing translation renders the raw key, which reads as a bug to visitors.
   */
  fallback?: string;
  as?: "span" | "p" | "div";
  className?: string;
}

/**
 * Renders one translated string from inside a Server Component.
 *
 * Marketing and auth pages stay Server Components (they own `metadata`) but
 * still need locale-aware copy. This is the bridge: the page passes a key and an
 * English fallback, and the string swaps when the visitor toggles language.
 */
export function T({ k, vars, fallback, as: Tag = "span", className }: TProps): ReactNode {
  const t = useTranslation();
  const value = t(k, vars);
  // `t` echoes the key back when a locale has no entry.
  const text = value === k ? (fallback ?? k) : value;
  return <Tag className={className}>{text}</Tag>;
}