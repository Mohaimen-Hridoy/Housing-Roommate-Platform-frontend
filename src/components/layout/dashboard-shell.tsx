"use client";

import { ChevronDown, ClipboardList, LogOut, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandMark, UserMenu } from "@/components/layout/site-chrome";
import { LanguageToggle } from "@/components/brand/language-toggle";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { useAuthContext } from "@/components/providers/app-providers";
import { useTranslation } from "@/components/providers/locale-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, initialsOf } from "@/lib/utils";

export interface NavItem {
  label: string;
  /** Dictionary key. Falls back to `label` when the locale has no entry. */
  labelKey?: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

export interface NavSection {
  title: string;
  titleKey?: string;
  items: NavItem[];
}

interface DashboardShellProps {
  sections: NavSection[];
  /** Shown at the top of the sidebar, e.g. "Tenant dashboard". */
  areaLabel: string;
  areaLabelKey?: string;
  children: React.ReactNode;
}

export function DashboardShell({ sections, areaLabel, areaLabelKey, children }: DashboardShellProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const t = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between gap-2">
        <BrandMark />
      </div>
      <p className="-mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
        {areaLabelKey ? t(areaLabelKey) : areaLabel}
      </p>

      <nav aria-label={t("nav.dashboardNav", { area: areaLabel })} className="flex-1 space-y-6 overflow-y-auto">
        {sections.map((section) => {
          const sectionTitle = section.titleKey ? t(section.titleKey) : section.title;
          return (
          <div key={section.titleKey ?? section.title} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {sectionTitle === section.titleKey ? section.title : sectionTitle}
            </p>
            {section.items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon ?? ClipboardList;
              const label = item.labelKey ? t(item.labelKey) : item.label;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "border-primary/15 bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">
                    {label === item.labelKey ? item.label : label}
                  </span>
                  {item.badge ? (
                    <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
          );
        })}
      </nav>

      <Separator />

      <div className="space-y-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{initialsOf(user.name, user.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name ?? t("nav.account")}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ) : null}
        <UserMenu />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageToggle />
        </div>
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
          {mobileOpen ? t("action.close") : t("nav.menu")}
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
        <main id="main-content" className="dashboard-main min-w-0 flex-1">
          <div className="container-page space-y-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function SignOutButton() {
  const { signOut } = useAuthContext();
  const t = useTranslation();
  return (
    <Button variant="outline" size="sm" onClick={() => void signOut()}>
      <LogOut className="size-4" />
      {t("nav.signOut")}
    </Button>
  );
}
