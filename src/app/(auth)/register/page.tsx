import type { Metadata } from "next";
import Link from "next/link";

import { registerAction } from "@/app/(auth)/actions";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandMark } from "@/components/layout/site-chrome";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Join NestSpace as a tenant to book rooms, or as an owner to publish listings and manage bookings.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="container-page py-10">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>

        <Card className="mx-auto w-full max-w-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
              <p className="text-sm text-muted-foreground">
                Already registered?{" "}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in instead
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
