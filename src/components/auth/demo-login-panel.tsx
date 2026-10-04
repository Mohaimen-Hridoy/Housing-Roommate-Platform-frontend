"use client";

import { useActionState, useState } from "react";
import { Rocket, ShieldCheck, UserRound } from "lucide-react";

import type { ActionState } from "@/app/(auth)/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import type { Role } from "@/lib/types/api";

const ROLE_ICON: Record<Role, typeof ShieldCheck> = {
  ADMIN: ShieldCheck,
  OWNER: UserRound,
  TENANT: Rocket,
};

interface DemoLoginPanelProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}

/**
 * Mandatory one-click demo login. Each seeded role signs in immediately and is
 * redirected to its own dashboard, so evaluators can test role-based UI without
 * typing credentials.
 */
export function DemoLoginPanel({ action }: DemoLoginPanelProps) {
  const [state, formAction, isPending] = useActionState(action, { status: "idle" });
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  function handleDemoClick(role: Role) {
    setLoadingRole(role);
    const formData = new FormData();
    formData.set("role", role);
    formAction(formData);
  }

  return (
    <div id="demo" className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-2 text-center">
        <Badge variant="accent">Quick demo access</Badge>
        <h2 className="text-xl font-semibold tracking-tight">One-click demo login</h2>
        <p className="text-sm text-muted-foreground">
          Pick a role to sign in instantly with a seeded account and land straight on that role&rsquo;s
          dashboard.
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = ROLE_ICON[account.role];
          const busy = isPending && loadingRole === account.role;
          return (
            <div
              key={account.role}
              className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{account.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{account.email}</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">{account.description}</p>

              <Button
                type="button"
                size="sm"
                className="mt-auto w-full"
                loading={busy}
                disabled={isPending}
                onClick={() => handleDemoClick(account.role)}
              >
                Demo Login · {account.label}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Demo accounts come from the backend seed (<code className="rounded bg-muted px-1 py-0.5">npm run db:seed</code>).
        Passwords follow the <code className="rounded bg-muted px-1 py-0.5">Role1234!</code> pattern.
      </p>
    </div>
  );
}
