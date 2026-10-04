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
    titleKey: "dash.overview",
    items: [
      { label: "Overview", labelKey: "dash.overview", href: "/dashboard", icon: DASHBOARD_ICONS.home, exact: true },
    ],
  },
  {
    title: "Housing",
    titleKey: "nav.housing",
    items: [
      { label: "My bookings", labelKey: "booking.title", href: "/dashboard/bookings", icon: DASHBOARD_ICONS.bookings },
      { label: "Favourites", labelKey: "dash.favorites", href: "/dashboard/favorites", icon: DASHBOARD_ICONS.favorites },
      { label: "Messages", labelKey: "dash.messages", href: "/dashboard/messages", icon: DASHBOARD_ICONS.messages },
    ],
  },
  {
    title: "Account",
    titleKey: "nav.accountSection",
    items: [
      { label: "Payments", labelKey: "dash.payments", href: "/dashboard/payments", icon: DASHBOARD_ICONS.payments },
      { label: "Reviews", labelKey: "dash.reviews", href: "/dashboard/reviews", icon: DASHBOARD_ICONS.reviews },
      { label: "Settings", labelKey: "dash.settings", href: "/dashboard/settings", icon: DASHBOARD_ICONS.settings },
    ],
  },
];

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell areaLabel="Tenant dashboard" areaLabelKey="area.tenant" sections={SECTIONS}>
      {children}
    </DashboardShell>
  );
}