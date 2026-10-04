"use client";

import { z } from "zod";

import { ServerActionForm } from "@/components/auth/server-action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/app/(auth)/actions";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[+\d][\d\s-]{6,19}$/.test(value), "Enter a valid phone number"),
});

type Values = z.infer<typeof profileSchema>;

/**
 * Pre-filled variant of `@/components/auth/password-forms#ProfileForm`, which
 * hard-codes empty defaults and therefore cannot show the current account data.
 */
export function PrefilledProfileForm({ name, phone }: { name: string; phone: string }) {
  const defaults: Values = { name, phone };

  return (
    <ServerActionForm<Values>
      action={updateProfileAction}
      schema={profileSchema}
      defaultValues={defaults}
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