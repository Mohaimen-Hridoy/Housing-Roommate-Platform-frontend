import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/layout/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { demoLoginAction, loginAction } from "@/app/(auth)/actions";
import { LoginForm } from "@/components/auth/login-form";
import { DemoLoginPanel } from "@/components/auth/demo-login-panel";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to NestSpace to book rooms, manage your listings or administer the platform. One-click demo logins are available for all three roles.",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="container-page py-10">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to continue to your dashboard. New here?{" "}
                  <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>

              <LoginForm action={loginAction} />

              <p className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
                <Link href="/forgot-password" className="underline underline-offset-4 hover:text-foreground">
                  Forgot your password?
                </Link>
              </p>
            </CardContent>
          </Card>

          <DemoLoginPanel action={demoLoginAction} />
        </div>
      </div>
    </div>
  );
}
