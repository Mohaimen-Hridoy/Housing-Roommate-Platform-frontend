"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect } from "react";
import { useForm, type FieldValues, type Resolver, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActionState } from "@/app/(auth)/actions";

const INITIAL_STATE: ActionState = { status: "idle" };

interface ServerActionFormProps<TValues extends FieldValues> {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  schema: z.ZodType<TValues, z.ZodTypeDef, unknown>;
  defaultValues: DefaultValues<TValues>;
  submitLabel: string;
  children: (form: UseFormReturn<TValues, unknown, TValues>) => React.ReactNode;
  successMessage?: string;
  className?: string;
}

type DefaultValues<TValues extends FieldValues> =
  NonNullable<Parameters<typeof useForm<TValues, unknown, TValues>>[0]>["defaultValues"];

/**
 * Bridges React Hook Form + Zod to a server action: client-side validation and
 * real-time messages happen locally, the server action performs the mutation,
 * and any returned field errors are mapped back onto the form.
 */
export function ServerActionForm<TValues extends FieldValues>({
  action,
  schema,
  defaultValues,
  submitLabel,
  children,
  successMessage,
  className,
}: ServerActionFormProps<TValues>) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const form = useForm<TValues, unknown, TValues>({
    resolver: zodResolver(schema) as Resolver<TValues, unknown>,
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      if (field === "root") continue;
      form.setError(field as never, { type: "server", message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null) continue;
      formData.set(key, typeof value === "string" ? value : String(value));
    }
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      {state.status === "error" && state.message ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" && (state.message ?? successMessage) ? (
        <Alert variant="success" className="mb-4">
          <AlertDescription>{state.message ?? successMessage}</AlertDescription>
        </Alert>
      ) : null}

      {children(form)}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? (
          <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : null}
        {isPending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}

export { INITIAL_STATE };
