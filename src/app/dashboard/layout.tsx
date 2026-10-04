import type { Metadata } from "next";

import { DashboardShell, type NavSection } from "@/components/layout/dashboard-shell";
import { DASHBOARD_ICONS } from "@/components/layout/site-chrome";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: "Tenant dashboard",
    template: "%s · Tenant dashboard",
  },
  description: `Manage bookings, favourites, messages, payments and reviews for your ${APP_NAME} tenant account.`,
  robots: { index: false, follow: false },
};

const SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Overview", href: "/dashboard", icon: DASHBOARD_ICONS.home, exact: true }],
  },
  {
    title: "Housing",
    items: [
      { label: "My bookings", href: "/dashboard/bookings", icon: DASHBOARD_ICONS.bookings },
      { label: "Favourites", href: "/dashboard/favorites", icon: DASHBOARD_ICONS.favorites },
      { label: "Messages", href: "/dashboard/messages", icon: DASHBOARD_ICONS.messages },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Payments", href: "/dashboard/payments", icon: DASHBOARD_ICONS.payments },
      { label: "Reviews", href: "/dashboard/reviews", icon: DASHBOARD_ICONS.reviews },
      { label: "Settings", href: "/dashboard/settings", icon: DASHBOARD_ICONS.settings },
    ],
  },
];

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell areaLabel="Tenant dashboard" sections={SECTIONS}>
      {children}
    </DashboardShell>
  );
}