"use client";

import {
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PlusCircle,
  Receipt,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  User as UserIcon,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAuthContext } from "@/components/providers/app-providers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/common/status-badge";
import { LogoMark } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/brand/language-toggle";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { useTranslation } from "@/components/providers/locale-provider";
import { APP_NAME, ROLE_HOME } from "@/lib/constants";
import { cn, initialsOf } from "@/lib/utils";

/**
 * Public navigation. Labels are dictionary keys rather than literals so the
 * whole chrome re-renders in Bangla the moment the visitor switches language.
 */
export const PUBLIC_NAV = [
  { labelKey: "nav.browse", href: "/properties" },
  { labelKey: "nav.howItWorks", href: "/how-it-works" },
  { labelKey: "nav.about", href: "/about" },
  { labelKey: "nav.faq", href: "/faq" },
  { labelKey: "nav.contact", href: "/contact" },
] as const;

export function BrandMark({ className }: { className?: string }) {
  const t = useTranslation();

  return (
    <Link
      href="/"
      aria-label={`${APP_NAME} ${t("common.home")}`}
      className={cn(
        "flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90",
        className,
      )}
    >
      <LogoMark className="size-9 shrink-0 text-primary" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.0625rem] font-semibold tracking-tight text-foreground">
          Nest<span className="text-primary">Space</span>
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("brand.tagline")}
        </span>
      </span>
    </Link>
  );
}

export function UserMenu() {
  const { user, signOut } = useAuthContext();
  const t = useTranslation();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("nav.accountMenu")}
        >
          <Avatar className="size-7">
            <AvatarFallback>{initialsOf(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:block">
            {user.name ?? user.email}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-1.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name ?? t("nav.account")}
          </p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
          <RoleBadge role={user.role} className="mt-1" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROLE_HOME[user.role]}>
            <LayoutDashboard />
            {t("nav.dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings />
            {t("nav.profileSettings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground">
          <span>Theme</span>
          <ThemeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => void signOut()}>
          <LogOut />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const t = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      {/* Hairline that only appears once the page has scrolled away from the
          top, so the header sits flush on the hero and gains an edge after. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" aria-hidden="true" />
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <BrandMark />

        <nav aria-label={t("nav.main")} className="hidden items-center gap-1 md:flex">
          {PUBLIC_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-out-expo hover:after:scale-x-100",
                  active
                    ? "text-foreground after:scale-x-100"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button asChild size="sm">
              <Link href={ROLE_HOME[user.role]}>{t("nav.dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </>
          )}
          {user ? <UserMenu /> : null}
          <LanguageToggle />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? t("action.close") : t("nav.menu")}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-b border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 md:hidden animate-accordion-down">
          <nav aria-label={t("nav.mobile")} className="container-page flex flex-col gap-1.5 py-5">
            {PUBLIC_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <span>{t(item.labelKey)}</span>
                  {active ? (
                    <span className="size-2 rounded-full bg-primary" />
                  ) : null}
                </Link>
              );
            })}

            <div className="mt-3 flex flex-col gap-2.5 border-t border-border/70 pt-4">
              {user ? (
                <div className="space-y-2">
                  <Button asChild className="w-full h-11 justify-center rounded-xl shadow-xs">
                    <Link href={ROLE_HOME[user.role]} onClick={() => setOpen(false)}>
                      {t("nav.goToDashboard")}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="h-11 rounded-xl">
                    <Link href="/login" onClick={() => setOpen(false)}>{t("nav.login")}</Link>
                  </Button>
                  <Button asChild className="h-11 rounded-xl shadow-xs">
                    <Link href="/register" onClick={() => setOpen(false)}>{t("nav.register")}</Link>
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">Language / ভাষা</span>
                <LanguageToggle />
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export const SITE_FOOTER_SECTIONS = [
  {
    titleKey: "footer.product",
    links: [
      { labelKey: "nav.browse", href: "/properties" },
      { labelKey: "nav.howItWorks", href: "/how-it-works" },
      { labelKey: "footer.pricingFees", href: "/faq#pricing" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { labelKey: "footer.aboutUs", href: "/about" },
      { labelKey: "nav.contact", href: "/contact" },
      { labelKey: "nav.faq", href: "/faq" },
    ],
  },
  {
    titleKey: "footer.accounts",
    links: [
      { labelKey: "nav.login", href: "/login" },
      { labelKey: "action.createAccount", href: "/register" },
    ],
  },
] as const;

export function SiteFooter() {
  const t = useTranslation();

  return (
    <footer id="site-footer" className="mt-auto bg-muted/30">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" aria-hidden="true" />
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-xs text-sm text-muted-foreground">{t("footer.blurb")}</p>
        </div>
        {SITE_FOOTER_SECTIONS.map((section) => (
          <div key={section.titleKey} className="space-y-3">
            <h3 className="text-sm font-semibold">{t(section.titleKey)}</h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href + link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. {t("footer.rights")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 shadow-xs backdrop-blur-sm">
              <span className="text-xs font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <p>{t("footer.stripeNote")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Icon set shared by the dashboard sidebars. */
export const DASHBOARD_ICONS = {
  home: Home,
  building: Building2,
  list: ClipboardList,
  bookings: ClipboardList,
  payments: CreditCard,
  wallet: Wallet,
  earnings: TrendingUp,
  reviews: Star,
  favorites: Heart,
  messages: MessageSquare,
  settings: Settings,
  users: Users,
  audit: ShieldCheck,
  receipts: Receipt,
  profile: UserIcon,
  notifications: Bell,
  add: PlusCircle,
  compose: Mail,
} as const;
