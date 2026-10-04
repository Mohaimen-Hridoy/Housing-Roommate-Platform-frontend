import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";

import { AppProviders } from "@/components/providers/app-providers";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { LOCALE_COOKIE, localeFromCookie } from "@/lib/i18n/locale";
import { getSessionUser } from "@/lib/auth/session";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Rent a room, list your property and manage bookings in one place. NestSpace connects tenants with verified property owners through transparent booking and secure Stripe payments.",
  keywords: [
    "housing",
    "roommate",
    "rental platform",
    "room booking",
    "shared housing",
    "property listing",
    "Stripe payments",
  ],
  authors: [{ name: APP_NAME }],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description:
      "Rent a room, list your property and manage bookings in one place. Transparent booking and secure Stripe payments.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: "Rent a room, list your property and manage bookings in one place.",
  },
  robots: { index: true, follow: true },
};

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

  return (
    <html lang={locale} className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans">
        <AppProviders user={user}>
          <LocaleProvider initialLocale={locale}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
            >
              Skip to content
            </a>
            {children}
          </LocaleProvider>
        </AppProviders>
      </body>
    </html>
  );
}
