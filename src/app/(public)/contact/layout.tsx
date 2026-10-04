import type { Metadata } from "next";

import { localizedMetadata } from "@/lib/i18n/metadata";

/**
 * The contact page is a client component (react-hook-form + live character
 * count), so its metadata lives here instead of in `page.tsx`.
 */
export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    titleKey: "meta.contact.title",
    descriptionKey: "contact.subtitle",
    canonical: "/contact",
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}