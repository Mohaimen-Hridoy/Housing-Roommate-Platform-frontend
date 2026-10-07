"use client";

import { useActionState, useState } from "react";
import { Building2, Rocket, ShieldCheck, Sparkles } from "lucide-react";

import type { ActionState } from "@/app/(auth)/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import type { Role } from "@/lib/types/api";

const ROLE_ICON: Record<Role, typeof ShieldCheck> = {
  ADMIN: ShieldCheck,
  OWNER: Building2,
  TENANT: Rocket,
};

interface DemoLoginPanelProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}

/**
 * Mandatory assignment requirement: One-click demo login for all 3 roles
 * (Admin, Owner, Tenant) allowing evaluators to immediately access role dashboards.
 */
export function DemoLoginPanel({ action }: DemoLoginPanelProps) {
  const t = useTranslation();
  const [state, formAction, isPending] = useActionState(action, { status: "idle" });
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  function handleDemoClick(role: Role) {
    setLoadingRole(role);
    const formData = new FormData();
    formData.set("role", role);
    formAction(formData);
  }

  return (
    <div
      id="demo"
      className="surface-raised edge-light relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 shadow-lg backdrop-blur-sm sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {t("auth.demoTitle2") || "1-Click Demo Login"}
            </h3>
            <p className="text-xs font-medium text-muted-foreground">
              {t("auth.demoBadge") || "For Evaluator Review"} · No password required
            </p>
          </div>
        </div>

        <Badge variant="accent" className="text-xs font-semibold">
          Seeded Roles
        </Badge>
      </div>

      {state.status === "error" && state.message ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = ROLE_ICON[account.role];
          const busy = isPending && loadingRole === account.role;
          const roleLabel = t(`auth.role.${account.role.toLowerCase()}`) || account.label;

          return (
            <div
              key={account.role}
              className="group flex flex-col justify-between rounded-xl border border-border/70 bg-background/70 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-background"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <p className="text-xs font-semibold text-foreground">{roleLabel}</p>
                </div>
                <p className="truncate text-xs font-medium text-muted-foreground">{account.email}</p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2.5 h-8 w-full text-xs font-medium shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                loading={busy}
                disabled={isPending}
                onClick={() => handleDemoClick(account.role)}
              >
                Log in as {roleLabel}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
