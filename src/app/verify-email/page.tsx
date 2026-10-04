import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm, ResendVerificationForm } from "@/components/auth/password-forms";
import { VerifyEmailForm } from "@/components/auth/password-forms";
import { forgotPasswordAction, resendVerificationAction, verifyEmailAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/layout/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Account recovery",
  description: "Reset your NestSpace password or verify your email address.",
};

export default function AccountRecoveryPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="container-page py-10">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>

        <Card className="mx-auto w-full max-w-lg">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Account recovery</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Reset your password or confirm your email address.{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Back to sign in
              </Link>
            </p>

            <Tabs defaultValue="password" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Forgot password</TabsTrigger>
                <TabsTrigger value="verify">Verify email</TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-4">
                <ForgotPasswordForm action={forgotPasswordAction} />
              </TabsContent>

              <TabsContent value="verify" className="space-y-6">
                <VerifyEmailForm action={verifyEmailAction} />
                <div className="space-y-3 border-t border-border pt-6">
                  <p className="text-sm font-medium">Verification email never arrived?</p>
                  <ResendVerificationForm action={resendVerificationAction} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
