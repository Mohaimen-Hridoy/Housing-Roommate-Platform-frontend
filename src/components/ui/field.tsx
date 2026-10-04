import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + inline validation message, shared by every form. */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
        {hint && !error ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface FieldRowProps {
  children: React.ReactNode;
  className?: string;
}

/** Two-column responsive row for form fields. */
export function FieldRow({ children, className }: FieldRowProps) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}
