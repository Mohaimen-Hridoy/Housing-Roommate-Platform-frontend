import type { Metadata } from "next";

import { APP_NAME } from "@/lib/constants";

/**
 * The contact page is a client component (react-hook-form + live character
 * count), so its metadata lives here instead of in `page.tsx`.
 */
export const metadata: Metadata = {
  title: "Contact us",
  description: `Get in touch with the ${APP_NAME} team. We can help with onboarding, partnerships, technical questions and demo access.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact ${APP_NAME}`,
    description: "Onboarding, partnerships, technical questions and demo access.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}