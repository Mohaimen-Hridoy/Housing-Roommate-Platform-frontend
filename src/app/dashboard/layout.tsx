import type { Metadata } from "next";

import { TenantShell } from "@/components/dashboard/tenant/tenant-shell";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: "Tenant dashboard",
    template: "%s · Tenant dashboard",
  },
  description: `Manage bookings, favourites, messages, payments and reviews for your ${APP_NAME} tenant account.`,
  robots: { index: false, follow: false },
};

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  return <TenantShell>{children}</TenantShell>;
}