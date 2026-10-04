import type { Metadata } from "next";

import { OwnerShell } from "@/components/dashboard/owner/owner-shell";

export const metadata: Metadata = {
  title: {
    default: "Owner dashboard",
    template: "%s · Owner dashboard",
  },
  description:
    "Manage your properties, room inventory, booking requests and earnings on the NestSpace owner dashboard.",
  robots: { index: false, follow: false },
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <OwnerShell>{children}</OwnerShell>;
}