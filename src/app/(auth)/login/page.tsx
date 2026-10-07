import type { Metadata } from "next";

import { localizedMetadata } from "@/lib/i18n/metadata";
import Link from "next/link";

import { BrandMark } from "@/components/layout/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { demoLoginAction, loginAction } from "@/app/(auth)/actions";
import { LoginForm } from "@/components/auth/login-form";
import { DemoLoginPanel } from "@/components/auth/demo-login-panel";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { LanguageToggle } from "@/components/brand/language-toggle";
import { T } from "@/components/common/localized-text";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    titleKey: "meta.login.title",
    descriptionKey: "auth.signInSubtitle",
  });
}

export default function LoginPage() {
  return (
    <div className="aurora grain relative min-h-dvh bg-background">
      <div className="container-page py-8 lg:py-12">
        <div className="mb-8 flex items-center justify-between">
          <BrandMark />
          <LanguageToggle />
        </div>

        {/* Balanced 2-column layout on desktop */}
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left column: Login Card & Mandatory Demo Login Panel */}
          <div className="mx-auto w-full max-w-lg space-y-5">
            <Card className="surface-raised edge-light shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6 space-y-1.5">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    <T k="auth.signInTitle" fallback="Welcome back" />
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    <T k="auth.signInSubtitle" fallback="Sign in to continue to your dashboard." />{" "}
                    <T k="auth.noAccount" fallback="New here?" />{" "}
                    <Link
                      href="/register"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      <T k="action.createAccount" fallback="Create an account" />
                    </Link>
                  </p>
                </div>

                <LoginForm action={loginAction} />

                <p className="mt-6 border-t border-border/70 pt-4 text-center text-sm text-muted-foreground">
                  <Link href="/forgot-password" className="underline underline-offset-4 hover:text-foreground">
                    <T k="auth.forgotPassword" fallback="Forgot your password?" />
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Mandatory One-Click Demo Login for Evaluator */}
            <DemoLoginPanel action={demoLoginAction} />
          </div>

          {/* Right column: Visual Trust & Photography Panel */}
          <AuthVisualPanel
            quote="Finding a verified apartment in Dhaka without broker hassle took me just 15 minutes. NestSpace is a game changer for students and young professionals."
            authorName="Tanvir Ahmed"
            authorRole="Verified Tenant · Dhanmondi, Dhaka"
          />
        </div>
      </div>
    </div>
  );
}