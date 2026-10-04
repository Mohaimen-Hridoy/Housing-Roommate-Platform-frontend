"use client";

import { z } from "zod";

import { ServerActionForm } from "@/components/auth/server-action-form";
import { Field, FieldRow } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/app/(auth)/actions";

const schema = z
  .object({
    role: z.enum(["TENANT", "OWNER"]),
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z
      .string()
      .optional()
      .refine((value) => !value || /^[+\d][\d\s-]{6,19}$/.test(value), "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ROLE_OPTIONS = [
  {
    value: "TENANT" as const,
    title: "I am looking for a room",
    description: "Search listings, request a booking and pay securely.",
  },
  {
    value: "OWNER" as const,
    title: "I want to list a property",
    description: "Publish listings, manage rooms and approve bookings.",
  },
];

export function RegisterForm({ action }: { action: (state: ActionState, formData: FormData) => Promise<ActionState> }) {
  return (
    <ServerActionForm
      action={action}
      schema={schema}
      defaultValues={{ role: "TENANT", name: "", email: "", phone: "", password: "", confirmPassword: "" }}
      submitLabel="Create account"
    >
      {(form) => {
        const role = form.watch("role");
        return (
          <div className="space-y-5">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Account type</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors",
                      role === option.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={option.value}
                        className="size-4 accent-[hsl(var(--primary))]"
                        {...form.register("role")}
                      />
                      <span className="text-sm font-medium">{option.title}</span>
                    </span>
                    <span className="pl-6 text-xs text-muted-foreground">{option.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Full name" htmlFor="name" error={form.formState.errors.name?.message} required>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Jane Cooper"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
            </Field>

            <FieldRow>
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

              <Field
                label="Phone"
                htmlFor="phone"
                hint="Optional"
                error={form.formState.errors.phone?.message}
              >
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 0100"
                  aria-invalid={Boolean(form.formState.errors.phone)}
                  {...form.register("phone")}
                />
              </Field>
            </FieldRow>

            <FieldRow>
              <Field label="Password" htmlFor="password" error={form.formState.errors.password?.message} required>
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
                label="Confirm password"
                htmlFor="confirmPassword"
                error={form.formState.errors.confirmPassword?.message}
                required
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                  {...form.register("confirmPassword")}
                />
              </Field>
            </FieldRow>

            <p className="text-xs text-muted-foreground">
              By creating an account you agree to the platform terms. Passwords are hashed with bcrypt on
              the server and never stored in plain text.
            </p>
            <Label className="sr-only">Account type</Label>
          </div>
        );
      }}
    </ServerActionForm>
  );
}
