"use client";

import { useContext } from "react";

import { useAuthContext, AuthContext } from "@/components/providers/app-providers";
import type { SessionUser, Role } from "@/lib/types/api";

/**
 * Enhanced auth hook that provides the user session plus convenience helpers.
 */
export function useAuth() {
  const { user, refreshSession, signOut } = useAuthContext();

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user?.role) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.includes(user.role);
  };

  const isAdmin = () => hasRole("ADMIN");
  const isOwner = () => hasRole("OWNER");
  const isTenant = () => hasRole("TENANT");

  return {
    user,
    isAuthenticated: Boolean(user),
    hasRole,
    isAdmin,
    isOwner,
    isTenant,
    refreshSession,
    signOut,
  };
}

/**
 * Hook to access the raw session user without the convenience helpers.
 * Use this when you only need the user object and don't want to re-render
 * when the auth state changes (rare).
 */
export function useSessionUser(): SessionUser | null {
  const context = useContext(AuthContext);
  return context?.user ?? null;
}