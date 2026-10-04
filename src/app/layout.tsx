import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";

import { AppProviders } from "@/components/providers/app-providers";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { LOCALE_COOKIE, localeFromCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth/session";
import { getServerTranslator } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/config";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Mono for prices, counts and dates so digits align down a table.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

/**
 * Built per request so the tab title, share cards and search snippets follow the
 * visitor's language. A static export would pin English metadata for everyone.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  const name = t("brand.name");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("meta.title", { name }),
      template: t("meta.titleTemplate", { name }),
    },
    description: t("meta.description"),
    keywords: t("meta.keywords")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    authors: [{ name }],
    openGraph: {
      type: "website",
      siteName: name,
      title: t("meta.title", { name }),
      description: t("meta.ogDescription"),
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title", { name }),
      description: t("meta.twitterDescription"),
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1614" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  // Read the language server-side so the first paint is already in the right
  // language and the client never has to correct itself.
  const cookieStore = await cookies();
  const locale = localeFromCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans">
        <AppProviders user={user}>
          <LocaleProvider initialLocale={locale}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
            >
{dictionary["nav.skipToContent"]}
              </a>
              <a
                href="#site-footer"
                className="sr-only focus:not-sr-only focus:absolute focus:left-44 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
              >
                {dictionary["nav.skipToFooter"]}
              </a>
            {children}
          </LocaleProvider>
        </AppProviders>
      </body>
    </html>
  );
}
