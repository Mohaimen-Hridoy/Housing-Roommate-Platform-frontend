"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { clearSession, getSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/types/api";

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Reads the session mirror cookie so client components can render role-aware UI.
 * Real authorisation always happens in `src/middleware.ts` and the API's RBAC
 * middleware — this hook only drives what is rendered.
 */
export function useAuth(): AuthState {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await getSessionUser());
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, isLoading, refresh, logout };
}
