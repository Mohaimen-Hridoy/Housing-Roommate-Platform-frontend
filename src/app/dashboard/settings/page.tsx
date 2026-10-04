import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, KeyRound, LogOut, Mail, Phone, UserCog } from "lucide-react";

import { ChangePasswordForm } from "@/components/auth/password-forms";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { RoleBadge } from "@/components/common/status-badge";
import { SignOutButton } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/lib/api/endpoints";
import { apiDataSafe } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import type { SessionUser, User } from "@/lib/types/api";

import { PrefilledProfileForm } from "@/components/dashboard/tenant/prefilled-profile-form";
import { changePasswordAction } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Settings",
  description: "Update your name and phone number, change your password and review your account.",
  robots: { index: false, follow: false },
};

export default async function TenantSettingsPage() {
  const session = await getSessionUser();

  // `authApi.me()` is the only readable identity endpoint for a tenant.
  let account: SessionUser | null = session;
  let accountError: string | null = null;
  try {
    account = await authApi.me();
  } catch (error) {
    accountError = error instanceof Error ? error.message : "The API could not be reached.";
  }

  // `GET /users/:id` is admin-only, so the extended profile (phone, joined date)
  // is best-effort and the card degrades gracefully when it is not readable.
  const detail = session ? await apiDataSafe<User>(`/users/${session.id}`) : { data: null, error: null };

  const name = account?.name ?? session?.name ?? "";
  const email = account?.email ?? session?.email ?? "";
  const role = account?.role ?? session?.role ?? "TENANT";
  const phone = detail.data?.phone ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Tenant dashboard"
        title="Settings"
        description="Your profile details, password and account actions."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Settings" }]}
      />

      {accountError ? <ErrorState title="Profile could not be loaded" message={accountError} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="size-4" aria-hidden="true" />
                Profile
              </CardTitle>
              <CardDescription>
                Your name and phone number are stored on your account. Your email address cannot be changed here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrefilledProfileForm name={name} phone={phone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4" aria-hidden="true" />
                Password
              </CardTitle>
              <CardDescription>Use at least 8 characters with one letter and one number.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm action={changePasswordAction} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="size-4" aria-hidden="true" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-right text-sm font-medium">{name || "—"}</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" aria-hidden="true" />
                  Email
                </p>
                <p className="truncate text-right text-sm font-medium">{email || "—"}</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" aria-hidden="true" />
                  Phone
                </p>
                <p className="text-right text-sm font-medium">{phone || "Not set"}</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Member since
                </p>
                <p className="text-right text-sm font-medium">
                  {detail.data ? formatDate(detail.data.createdAt) : "—"}
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Role</p>
                <RoleBadge role={role} />
              </div>

              {detail.error ? (
                <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  The extended user record is admin-only, so phone and join date can only be shown when the API
                  exposes your own profile. Everything below still saves correctly.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="size-4" aria-hidden="true" />
                Session
              </CardTitle>
              <CardDescription>Sign out of this device and clear your local session cookies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SignOutButton />
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">Back to the public site</Link>
              </Button>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="outline">Tenant area</Badge>
                <Badge variant="outline">Session {session?.id.slice(0, 8) ?? "unknown"}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}