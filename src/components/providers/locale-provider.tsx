"use client";

import * as React from "react";

import {
  LOCALE_HTML_LANG,
  getDictionary,
  type Dictionary,
  type Locale,
} from "@/lib/i18n/dictionaries";

import { LOCALE_COOKIE } from "@/lib/i18n/locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatDate: (value: string | Date | null | undefined, pattern?: string) => string;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

/** Replaces `{{name}}` placeholders. Missing keys fall back to the key itself. */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);
  const dictionary = React.useMemo<Dictionary>(() => getDictionary(locale), [locale]);

  React.useEffect(() => {
    // Keep the document language in sync for screen readers and hyphenation.
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, []);

  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => interpolate(dictionary[key] ?? key, vars),
      formatDate: (value, pattern) => {
        if (!value) return "—";
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
          dateStyle: pattern ? undefined : "medium",
          day: pattern ? "numeric" : undefined,
          month: pattern ? "long" : undefined,
          year: pattern ? "numeric" : undefined,
        }).format(date);
      },
    }),
    [dictionary, locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * Reads the active locale. Safe to call outside the provider — it then behaves
 * as English-only, so a component is never forced to sit inside the tree.
 */
export function useLocale(): LocaleContextValue {
  const context = React.useContext(LocaleContext);
  const fallback = React.useMemo<LocaleContextValue>(
    () => ({
      locale: "en",
      setLocale: () => {},
      t: (key, vars) => interpolate(getDictionary("en")[key] ?? key, vars),
      formatDate: (value) => (value ? new Date(value).toLocaleDateString("en-GB") : "—"),
    }),
    [],
  );
  return context ?? fallback;
}

/** Convenience hook for components that only need the translate function. */
export function useTranslation() {
  return useLocale().t;
}