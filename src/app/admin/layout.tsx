"use client";

import { DashboardShell, type NavSection } from "@/components/layout/dashboard-shell";
import { DASHBOARD_ICONS } from "@/components/layout/site-chrome";

/**
 * Admin console shell.
 *
 * `"use client"` is required here: `DASHBOARD_ICONS` is exported from a client
 * module (`site-chrome`) and the RSC runtime refuses to dot into a client
 * module from a Server Component ("You cannot dot into a client module from a
 * server component"). Keeping the nav in the client graph lets the layout pass
 * real icon components to `DashboardShell`. Every `/admin` page still exports
 * its own `metadata` with `robots: { index: false }`.
 */
const SECTIONS: NavSection[] = [
  {
    title: "Console",
    items: [
      { label: "Overview", href: "/admin", icon: DASHBOARD_ICONS.home, exact: true },
      { label: "Users", href: "/admin/users", icon: DASHBOARD_ICONS.users },
      { label: "Properties", href: "/admin/properties", icon: DASHBOARD_ICONS.building },
      { label: "Bookings", href: "/admin/bookings", icon: DASHBOARD_ICONS.bookings },
      { label: "Payments", href: "/admin/payments", icon: DASHBOARD_ICONS.payments },
      { label: "Amenities", href: "/admin/amenities", icon: DASHBOARD_ICONS.add },
      { label: "Audit logs", href: "/admin/audit-logs", icon: DASHBOARD_ICONS.audit },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell sections={SECTIONS} areaLabel="Admin console">
      {children}
    </DashboardShell>
  );
}