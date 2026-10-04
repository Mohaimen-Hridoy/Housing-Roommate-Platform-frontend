import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/password-forms";
import { resetPasswordAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/layout/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your NestSpace account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="min-h-dvh bg-background">
      <div className="container-page py-10">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>

        <Card className="mx-auto w-full max-w-md">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Choose a strong password you have not used on this account before.
            </p>

            {token ? (
              <div className="mt-6">
                <ResetPasswordForm action={resetPasswordAction} token={token} />
              </div>
            ) : (
              <Alert variant="warning" className="mt-6">
                <AlertDescription>
                  This reset link is missing its token. Request a new link from the forgot-password page.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
