"use client";

import { DashboardShell, type NavSection } from "@/components/layout/dashboard-shell";
import { DASHBOARD_ICONS } from "@/components/layout/site-chrome";

const OWNER_NAV: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Overview", href: "/owner", icon: DASHBOARD_ICONS.home, exact: true }],
  },
  {
    title: "Listings",
    items: [
      { label: "Listings", href: "/owner/listings", icon: DASHBOARD_ICONS.building },
      { label: "New listing", href: "/owner/listings/new", icon: DASHBOARD_ICONS.add },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Booking requests", href: "/owner/bookings", icon: DASHBOARD_ICONS.bookings },
      { label: "Earnings", href: "/owner/earnings", icon: DASHBOARD_ICONS.earnings },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", href: "/owner/settings", icon: DASHBOARD_ICONS.settings }],
  },
];

/** Sidebar + content frame for every `/owner/**` route. */
export function OwnerShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell sections={OWNER_NAV} areaLabel="Owner dashboard">
      {children}
    </DashboardShell>
  );
}