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
import { APP_NAME, ROLE_HOME } from "@/lib/constants";
import { cn, initialsOf } from "@/lib/utils";

export const PUBLIC_NAV = [
  { label: "Browse rooms", href: "/properties" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Home className="size-4" aria-hidden="true" />
      </span>
      <span className="text-lg">{APP_NAME}</span>
    </Link>
  );
}

export function UserMenu() {
  const { user, signOut } = useAuthContext();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
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
          <p className="truncate text-sm font-semibold text-foreground">{user.name ?? "Account"}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
          <RoleBadge role={user.role} className="mt-1" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROLE_HOME[user.role]}>
            <LayoutDashboard />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings />
            Profile & settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => void signOut()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <BrandMark />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {PUBLIC_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button asChild size="sm">
              <Link href={ROLE_HOME[user.role]}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
          {user ? <UserMenu /> : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <>
                  <Button asChild>
                    <Link href={ROLE_HOME[user.role]}>Go to dashboard</Link>
                  </Button>
                  <UserMenu />
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export const SITE_FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Browse rooms", href: "/properties" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing & fees", href: "/faq#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Accounts",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Demo login", href: "/login#demo" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-xs text-sm text-muted-foreground">
            A housing and roommate platform where tenants book verified rooms and owners manage
            listings, bookings and payouts in one place.
          </p>
        </div>
        {SITE_FOOTER_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-sm font-semibold">{section.title}</h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {APP_NAME}. Academic project — B7A7 assignment.</p>
          <p>Payments processed securely by Stripe (test mode).</p>
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
