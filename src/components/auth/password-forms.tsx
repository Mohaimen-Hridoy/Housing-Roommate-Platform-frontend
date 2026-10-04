"use client";

import { z } from "zod";

import { ServerActionForm } from "@/components/auth/server-action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export function ForgotPasswordForm({ action }: { action: (state: ActionState, formData: FormData) => Promise<ActionState> }) {
  return (
    <ServerActionForm
      action={action}
      schema={schema}
      defaultValues={{ email: "" }}
      submitLabel="Send reset link"
    >
      {(form) => (
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
      )}
    </ServerActionForm>
  );
}

const resetSchema = z
  .object({
    token: z.string().min(1, "Reset token is missing"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm({
  action,
  token,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  token: string;
}) {
  return (
    <ServerActionForm
      action={action}
      schema={resetSchema}
      defaultValues={{ token, password: "", confirmPassword: "" }}
      submitLabel="Update password"
    >
      {(form) => (
        <div className="space-y-4">
          <input type="hidden" {...form.register("token")} />
          <Field label="New password" htmlFor="password" error={form.formState.errors.password?.message} required>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
          </Field>
          <Field
            label="Confirm new password"
            htmlFor="confirmPassword"
            error={form.formState.errors.confirmPassword?.message}
            required
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              aria-invalid={Boolean(form.formState.errors.confirmPassword)}
              {...form.register("confirmPassword")}
            />
          </Field>
        </div>
      )}
    </ServerActionForm>
  );
}

export function VerifyEmailForm({ action }: { action: (state: ActionState, formData: FormData) => Promise<ActionState> }) {
  return (
    <ServerActionForm
      action={action}
      schema={z.object({ token: z.string().min(1, "Verification token is missing") })}
      defaultValues={{ token: "" }}
      submitLabel="Verify email"
    >
      {(form) => (
        <Field
          label="Verification token"
          htmlFor="token"
          hint="From the email link"
          error={form.formState.errors.token?.message}
          required
        >
          <Input id="token" placeholder="Paste the token from your email" {...form.register("token")} />
        </Field>
      )}
    </ServerActionForm>
  );
}

export function ResendVerificationForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  return (
    <ServerActionForm
      action={action}
      schema={schema}
      defaultValues={{ email: "" }}
      submitLabel="Resend verification email"
    >
      {(form) => (
        <Field label="Email" htmlFor="resend-email" error={form.formState.errors.email?.message} required>
          <Input
            id="resend-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </Field>
      )}
    </ServerActionForm>
  );
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function ChangePasswordForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  return (
    <ServerActionForm
      action={action}
      schema={changePasswordSchema}
      defaultValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
      submitLabel="Update password"
    >
      {(form) => (
        <div className="space-y-4">
          <Field
            label="Current password"
            htmlFor="currentPassword"
            error={form.formState.errors.currentPassword?.message}
            required
          >
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(form.formState.errors.currentPassword)}
              {...form.register("currentPassword")}
            />
          </Field>
          <Field
            label="New password"
            htmlFor="newPassword"
            error={form.formState.errors.newPassword?.message}
            required
          >
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(form.formState.errors.newPassword)}
              {...form.register("newPassword")}
            />
          </Field>
          <Field
            label="Confirm new password"
            htmlFor="confirmPassword"
            error={form.formState.errors.confirmPassword?.message}
            required
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(form.formState.errors.confirmPassword)}
              {...form.register("confirmPassword")}
            />
          </Field>
        </div>
      )}
    </ServerActionForm>
  );
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || /^[+\d][\d\s-]{6,19}$/.test(value), "Enter a valid phone number"),
});

interface ProfileFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  /** Pre-fills the form, typically from `authApi.me()`. */
  defaultValues?: { name?: string | null; phone?: string | null };
}

export function ProfileForm({ action, defaultValues }: ProfileFormProps) {
  return (
    <ServerActionForm
      action={action}
      schema={profileSchema}
      defaultValues={{ name: defaultValues?.name ?? "", phone: defaultValues?.phone ?? "" }}
      submitLabel="Save changes"
    >
      {(form) => (
        <div className="space-y-4">
          <Field label="Full name" htmlFor="profile-name" error={form.formState.errors.name?.message} required>
            <Input
              id="profile-name"
              autoComplete="name"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
          </Field>
          <Field
            label="Phone number"
            htmlFor="profile-phone"
            hint="Optional"
            error={form.formState.errors.phone?.message}
          >
            <Input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 555 0100"
              aria-invalid={Boolean(form.formState.errors.phone)}
              {...form.register("phone")}
            />
          </Field>
        </div>
      )}
    </ServerActionForm>
  );
}
