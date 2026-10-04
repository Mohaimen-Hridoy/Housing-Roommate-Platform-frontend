import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/password-forms";
import { forgotPasswordAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/layout/site-chrome";
import { LanguageToggle } from "@/components/brand/language-toggle";
import { T } from "@/components/common/localized-text";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password reset link for your NestSpace account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="container-page py-10">
        <div className="mb-8 flex items-center justify-between">
          <BrandMark />
          <LanguageToggle />
        </div>

        <Card className="mx-auto w-full max-w-md">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              <T k="auth.forgotPassword" fallback="Forgot your password?" />
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              <T
                k="auth.forgotBody"
                fallback="Enter the email address on your account and we’ll send a reset link."
              />
            </p>
            <div className="mt-6">
              <ForgotPasswordForm action={forgotPasswordAction} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
