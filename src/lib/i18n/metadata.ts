import "server-only";

import type { Metadata } from "next";

import { getServerTranslator } from "@/lib/i18n/server";

interface PageMeta {
  /** Dictionary key holding the page title. */
  titleKey: string;
  /** Dictionary key holding the meta description. Falls back to the subtitle. */
  descriptionKey: string;
  /** Absolute path this page is canonical for. */
  canonical?: string;
}

/**
 * Builds a page's `generateMetadata` result in the visitor's language.
 *
 * Page titles and subtitles already exist in both dictionaries, so metadata
 * stays in step with the on-page copy instead of drifting into a second set of
 * hardcoded English strings.
 */
export async function localizedMetadata({
  titleKey,
  descriptionKey,
  canonical,
}: PageMeta): Promise<Metadata> {
  const { t } = await getServerTranslator();
  const title = t(titleKey);
  const description = t(descriptionKey);

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      ...(canonical ? { url: canonical } : {}),
    },
  };
}
