import type { Metadata } from "next";
import { KeyRound, LogOut, Mail, ShieldCheck, User as UserIcon } from "lucide-react";

import { changePasswordAction, updateProfileAction } from "@/app/(auth)/actions";
import { ChangePasswordForm, ProfileForm } from "@/components/auth/password-forms";
import { RoleBadge } from "@/components/common/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/layout/dashboard-shell";
import { getSessionUser } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/constants";
import { initialsOf } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings",
  description: "Update your owner profile, change your password and sign out of NestSpace.",
  robots: { index: false, follow: false },
};

export default async function OwnerSettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Owner dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>You are not signed in. Sign in again to manage your owner profile.</AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Owner dashboard</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Your owner account, password and session. Changes are validated locally and saved through server actions.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">{initialsOf(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate">{user.name ?? "Property owner"}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" aria-hidden="true" />
                {user.email}
              </span>
              <RoleBadge role={user.role} />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Account id</dt>
              <dd className="truncate font-mono text-xs">{user.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Role</dt>
              <dd className="font-medium">Property owner</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Area</dt>
              <dd className="font-medium">/owner</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-4 text-primary" aria-hidden="true" />
              Profile
            </CardTitle>
            <CardDescription>
              Owners use the same profile as every other role — the name and phone shown on your listings and to
              tenants.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="default">
<AlertDescription>
              Email and role are managed by an administrator. Your phone number is not returned by the session
              endpoint, so re-enter it here if you want to keep it on file.
            </AlertDescription>
            </Alert>
            <ProfileForm action={updateProfileAction} defaultValues={{ name: user.name }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" aria-hidden="true" />
              Password
            </CardTitle>
            <CardDescription>
              Changing your password signs every device out of {APP_NAME}. Use at least 8 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm action={changePasswordAction} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="size-4 text-destructive" aria-hidden="true" />
            Sign out
          </CardTitle>
          <CardDescription>
            Ends this session on {APP_NAME}. Your listings, rooms and bookings stay exactly as they are.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <SignOutButton />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Access tokens are stored in httpOnly cookies and never exposed to the browser bundle.
          </p>
        </CardContent>
      </Card>
    </>
  );
}