import type { Metadata } from "next";
import Link from "next/link";

import { registerAction } from "@/app/(auth)/actions";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandMark } from "@/components/layout/site-chrome";
import { LanguageToggle } from "@/components/brand/language-toggle";
import { T } from "@/components/common/localized-text";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    titleKey: "meta.register.title",
    descriptionKey: "auth.registerTitle",
  });
}

export default function RegisterPage() {
  return (
    <div className="aurora grain relative min-h-dvh bg-background">
      <div className="container-page py-10">
        <div className="mb-8 flex items-center justify-between">
          <BrandMark />
          <LanguageToggle />
        </div>

        <Card className="mx-auto w-full max-w-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                <T k="auth.registerTitle" fallback="Create your account" />
              </h1>
              <p className="text-sm text-muted-foreground">
                <T k="auth.haveAccount" fallback="Already registered?" />{" "}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  <T k="action.signIn" fallback="Sign in instead" />
                </Link>
              </p>
            </div>

            <RegisterForm action={registerAction} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
