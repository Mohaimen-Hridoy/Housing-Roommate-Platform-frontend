"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo } from "react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/theme-provider";
import type { SessionUser } from "@/lib/types/api";

export interface AuthContextValue {
  user: SessionUser | null;
  /** Re-reads the session from the server after a login or profile change. */
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within <AppProviders>");
  return context;
}

/**
 * Single client-side provider: the session mirror for role-aware rendering, the
 * theme controller, and the global Sonner toaster.
 *
 * Data fetching is deliberately Server-first — route components read the API
 * through `@/lib/api/server` and stream the result — so there is no client cache
 * to invalidate and no second source of truth for server data.
 */
export function AppProviders({ children, user }: { children: React.ReactNode; user: SessionUser | null }) {
  const router = useRouter();

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      refreshSession: async () => {
        router.refresh();
      },
      signOut: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
      },
    }),
    [router, user],
  );

  return (
    <ThemeProvider>
      <AuthContext.Provider value={value}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
