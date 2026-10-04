"use client";

import { DashboardShell, type NavSection } from "@/components/layout/dashboard-shell";
import { DASHBOARD_ICONS } from "@/components/layout/site-chrome";

const OWNER_NAV: NavSection[] = [
  {
    title: "Overview",
    titleKey: "dash.overview",
    items: [
      { label: "Overview", labelKey: "dash.overview", href: "/owner", icon: DASHBOARD_ICONS.home, exact: true },
    ],
  },
  {
    title: "Listings",
    titleKey: "dash.listings",
    items: [
      { label: "Listings", labelKey: "dash.listings", href: "/owner/listings", icon: DASHBOARD_ICONS.building },
      { label: "New listing", labelKey: "dash.newListing", href: "/owner/listings/new", icon: DASHBOARD_ICONS.add },
    ],
  },
  {
    title: "Operations",
    titleKey: "nav.operations",
    items: [
      { label: "Booking requests", labelKey: "nav.bookingRequests", href: "/owner/bookings", icon: DASHBOARD_ICONS.bookings },
      { label: "Earnings", labelKey: "dash.earnings", href: "/owner/earnings", icon: DASHBOARD_ICONS.earnings },
    ],
  },
  {
    title: "Account",
    titleKey: "nav.accountSection",
    items: [{ label: "Settings", labelKey: "dash.settings", href: "/owner/settings", icon: DASHBOARD_ICONS.settings }],
  },
];

/** Sidebar + content frame for every `/owner/**` route. */
export function OwnerShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell sections={OWNER_NAV} areaLabel="Owner dashboard" areaLabelKey="area.owner">
      {children}
    </DashboardShell>
  );
}