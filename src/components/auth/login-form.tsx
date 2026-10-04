"use client";

import { z } from "zod";

import { ServerActionForm } from "@/components/auth/server-action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
}

export function LoginForm({ action, submitLabel = "Sign in" }: LoginFormProps) {
  return (
    <ServerActionForm
      action={action}
      schema={schema}
      defaultValues={{ email: "", password: "" }}
      submitLabel={submitLabel}
    >
      {(form) => (
        <div className="space-y-4">
          <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message} required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={form.formState.errors.password?.message} required>
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
