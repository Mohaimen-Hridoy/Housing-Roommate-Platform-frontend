"use client";

import { z } from "zod";

import { ServerActionForm } from "@/components/auth/server-action-form";
import { Field, FieldRow } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/app/(auth)/actions";

const ROLE_OPTIONS = [
  { value: "TENANT" as const, titleKey: "register.roleTenant", bodyKey: "register.roleTenantBody" },
  { value: "OWNER" as const, titleKey: "register.roleOwner", bodyKey: "register.roleOwnerBody" },
];

export function RegisterForm({ action }: { action: (state: ActionState, formData: FormData) => Promise<ActionState> }) {
  const t = useTranslation();

  // Built per render so validation messages follow the active language.
  const schema = z
    .object({
      role: z.enum(["TENANT", "OWNER"]),
      name: z.string().min(2, t("auth.err.nameMin")).max(100, t("auth.err.nameMax")),
      email: z.string().min(1, t("auth.err.emailRequired")).email(t("auth.err.emailInvalid")),
      phone: z
        .string()
        .optional()
        .refine((value) => !value || /^[+\d][\d\s-]{6,19}$/.test(value), t("auth.err.phoneInvalid")),
      password: z
        .string()
        .min(8, t("auth.err.passwordMin"))
        .regex(/[A-Za-z]/, t("auth.err.passwordLetter"))
        .regex(/[0-9]/, t("auth.err.passwordDigit")),
      confirmPassword: z.string().min(1, t("auth.err.confirmRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.err.passwordMismatch"),
      path: ["confirmPassword"],
    });

  return (
    <ServerActionForm
      action={action}
      schema={schema}
      defaultValues={{ role: "TENANT", name: "", email: "", phone: "", password: "", confirmPassword: "" }}
      submitLabel={t("action.signUp")}
    >
      {(form) => {
        const role = form.watch("role");
        return (
          <div className="space-y-5">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t("register.accountType")}</legend>
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
                      <span className="text-sm font-medium">{t(option.titleKey)}</span>
                    </span>
                    <span className="pl-6 text-xs text-muted-foreground">{t(option.bodyKey)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field
              label={t("auth.name")}
              htmlFor="name"
              error={form.formState.errors.name?.message}
              required
            >
              <Input
                id="name"
                autoComplete="name"
                placeholder="Jane Cooper"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
            </Field>

            <FieldRow>
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
                label={t("auth.phone")}
                htmlFor="phone"
                hint={t("misc.optional")}
                error={form.formState.errors.phone?.message}
              >
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+880 1700 000000"
                  aria-invalid={Boolean(form.formState.errors.phone)}
                  {...form.register("phone")}
                />
              </Field>
            </FieldRow>

            <FieldRow>
              <Field
                label={t("auth.password")}
                htmlFor="password"
                error={form.formState.errors.password?.message}
                required
              >
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("register.passwordPlaceholder")}
                  aria-invalid={Boolean(form.formState.errors.password)}
                  {...form.register("password")}
                />
              </Field>

              <Field
                label={t("register.confirmPassword")}
                htmlFor="confirmPassword"
                error={form.formState.errors.confirmPassword?.message}
                required
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("register.confirmPlaceholder")}
                  aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                  {...form.register("confirmPassword")}
                />
              </Field>
            </FieldRow>

            <p className="text-xs text-muted-foreground">{t("register.terms")}</p>
            <Label className="sr-only">{t("register.accountType")}</Label>
          </div>
        );
      }}
    </ServerActionForm>
  );
}
