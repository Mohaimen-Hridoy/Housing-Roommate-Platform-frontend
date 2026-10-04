"use client";

import { ChevronDown, LogOut, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandMark, UserMenu } from "@/components/layout/site-chrome";
import { useAuthContext } from "@/components/providers/app-providers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, initialsOf } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface DashboardShellProps {
  sections: NavSection[];
  /** Shown at the top of the sidebar, e.g. "Tenant dashboard". */
  areaLabel: string;
  children: React.ReactNode;
}

export function DashboardShell({ sections, areaLabel, children }: DashboardShellProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between gap-2">
        <BrandMark />
      </div>
      <p className="-mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{areaLabel}</p>

      <nav aria-label={`${areaLabel} navigation`} className="flex-1 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <Separator />

      <div className="space-y-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{initialsOf(user.name, user.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name ?? "Account"}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ) : null}
        <UserMenu />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Mobile bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background px-4 lg:hidden">
        <BrandMark />
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-mobile-nav"
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? "Close" : "Menu"}
          <ChevronDown className={cn("size-4 transition-transform", mobileOpen && "rotate-180")} />
        </Button>
      </div>

      {mobileOpen ? (
        <div id="dashboard-mobile-nav" className="border-b border-border bg-background lg:hidden">
          {sidebar}
        </div>
      ) : null}

      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-card lg:block">
          {sidebar}
        </aside>
        <main id="main-content" className="min-w-0 flex-1">
          <div className="container-page space-y-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function SignOutButton() {
  const { signOut } = useAuthContext();
  return (
    <Button variant="outline" size="sm" onClick={() => void signOut()}>
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
