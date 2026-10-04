import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/dictionaries";

/** Cookie holding the visitor's chosen language. Readable by the server. */
export const LOCALE_COOKIE = "hsg_locale";

/**
 * Resolves a locale from a raw cookie value, falling back to the default.
 *
 * Kept free of any `"use client"` directive so the root layout (a Server
 * Component) can read the cookie before the first paint.
 */
export function localeFromCookie(raw: string | undefined | null): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}