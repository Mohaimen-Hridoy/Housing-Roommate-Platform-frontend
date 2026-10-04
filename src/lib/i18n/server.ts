import "server-only";

import { cookies } from "next/headers";

import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { LOCALE_COOKIE, localeFromCookie } from "@/lib/i18n/locale";

export interface ServerTranslator {
  locale: Locale;
  /** Resolves a key for the request locale, falling back to `fallback`. */
  t: (key: string, vars?: Record<string, string | number>, fallback?: string) => string;
}

/**
 * Dictionary access for Server Components.
 *
 * The root layout already awaits `cookies()` for the locale and session user, so
 * every route is dynamic and reading the cookie here costs nothing extra. Using
 * it means translated copy is correct in the very first paint — a client-side
 * `useTranslation` would render English and swap afterwards, which is a visible
 * flash and worse for crawlers.
 */
export async function getServerTranslator(): Promise<ServerTranslator> {
  const store = await cookies();
  const locale = localeFromCookie(store.get(LOCALE_COOKIE)?.value);
  const dictionary = getDictionary(locale);

  return {
    locale,
    t: (key, vars, fallback) => {
      const template = dictionary[key];
      if (template === undefined) return fallback ?? key;
      if (!vars) return template;
      return template.replace(/\{\{?(\w+)\}?\}/g, (match, name: string) =>
        name in vars ? String(vars[name]) : match,
      );
    },
  };
}