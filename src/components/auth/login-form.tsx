"use client";

import { z } from "zod";

import { useSearchParams } from "next/navigation";
import { ServerActionForm } from "@/components/auth/server-action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import type { ActionState } from "@/app/(auth)/actions";

interface LoginFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
}

export function LoginForm({ action, submitLabel }: LoginFormProps) {
  const t = useTranslation();

  // Built per render so validation messages follow the active language.
  const schema = z.object({
    email: z.string().min(1, t("auth.err.emailRequired")).email(t("auth.err.emailInvalid")),
    password: z.string().min(1, t("auth.err.passwordRequired")),
  });

  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  return (
    <ServerActionForm
      action={action}
      schema={schema}
      defaultValues={{ email: "", password: "" }}
      submitLabel={submitLabel ?? t("action.signIn")}
    >
      {(form) => (
        <div className="space-y-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <Field
            label={t("auth.email")}
            htmlFor="email"
            error={form.formState.errors.email?.message}
            required
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
          </Field>

          <Field
            label={t("auth.password")}
            htmlFor="password"
            error={form.formState.errors.password?.message}
            required
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
          </Field>
        </div>
      )}
    </ServerActionForm>
  );
}
