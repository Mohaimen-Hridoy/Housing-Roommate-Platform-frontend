"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
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
 * Single client-side provider: TanStack Query for server state, the session
 * mirror for role-aware rendering, the theme controller, and the global Sonner
 * toaster.
 */
export function AppProviders({ children, user }: { children: React.ReactNode; user: SessionUser | null }) {
  const router = useRouter();

  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
          mutations: { retry: 0 },
        },
      }),
  );

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
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthContext.Provider value={value}>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
