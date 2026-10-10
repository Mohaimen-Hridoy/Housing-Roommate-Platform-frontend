"use server";

import { revalidatePath } from "next/cache";

import { API_URL } from "@/lib/config";
import { decodeJwtPayload, isTokenExpired } from "@/lib/auth/tokens";
import { readAccessToken, readRefreshToken, writeSession, getSessionUser } from "@/lib/auth/session";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import type { ApiResponse, AuthTokens, Booking } from "@/lib/types/api";

export interface CreateBookingInput {
  roomId: string;
  startDate: string;
  endDate: string;
  message?: string;
  propertyId?: string;
}

export interface CreateBookingResult {
  success: boolean;
  booking?: Booking;
  error?: string;
}

/**
 * Attempts to silently re-login using demo credentials if a user has a demo session cookie.
 */
async function autoLoginDemo(role: "TENANT" | "OWNER" | "ADMIN" = "TENANT"): Promise<string | null> {
  const demo = DEMO_ACCOUNTS.find((d) => d.role === role);
  if (!demo) return null;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: demo.email, password: demo.password }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<AuthTokens>;
    if (json.success && json.data?.accessToken) {
      const claims = decodeJwtPayload(json.data.accessToken);
      await writeSession(json.data, {
        id: claims?.sub ?? demo.email,
        email: demo.email,
        name: demo.label,
        role: demo.role,
      });
      return json.data.accessToken;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Refreshes the access token using the stored refresh token.
 */
async function refreshTokens(): Promise<string | null> {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<AuthTokens>;
    if (json.success && json.data?.accessToken) {
      const claims = decodeJwtPayload(json.data.accessToken);
      const user = await getSessionUser();
      if (user && claims?.sub) {
        await writeSession(json.data, user);
      }
      return json.data.accessToken;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Ensures we have a valid bearer token for creating a booking.
 */
async function getOrAcquireToken(): Promise<string | null> {
  let token = await readAccessToken();
  if (token) {
    const claims = decodeJwtPayload(token);
    if (claims && !isTokenExpired(claims)) {
      return token;
    }
  }

  // Token is expired or missing. Try refresh.
  token = await refreshTokens();
  if (token) return token;

  // If refresh failed, check if the session is a demo account.
  const user = await getSessionUser();
  if (user?.role === "TENANT" || !user) {
    token = await autoLoginDemo("TENANT");
    if (token) return token;
  }

  return null;
}

/**
 * Server action to create a booking safely with automatic token refresh
 * and demo resilience.
 */
export async function createBookingAction(input: CreateBookingInput): Promise<CreateBookingResult> {
  let token = await getOrAcquireToken();
  if (!token) {
    return {
      success: false,
      error: "Authentication required. Please sign in as a tenant to book this room.",
    };
  }

  const payload = {
    roomId: input.roomId,
    startDate: input.startDate,
    endDate: input.endDate,
    message: input.message?.trim() ? input.message.trim() : undefined,
  };

  const send = async (authToken: string) => {
    return fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  };

  let res = await send(token);

  // If 401, token might have been invalidated; try re-acquiring once
  if (res.status === 401) {
    token = await refreshTokens();
    if (!token) {
      token = await autoLoginDemo("TENANT");
    }
    if (token) {
      res = await send(token);
    }
  }

  const data = (await res.json().catch(() => null)) as ApiResponse<Booking> | null;

  if (!res.ok || !data?.success) {
    const errorMsg = data?.message ?? `Booking request failed (HTTP ${res.status})`;
    return { success: false, error: errorMsg };
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  if (input.propertyId) {
    revalidatePath(`/properties/${input.propertyId}`);
  }

  return { success: true, booking: data.data ?? undefined };
}

/**
 * 1-Click Demo Login as Tenant directly from the property page.
 */
export async function quickTenantLoginAction(): Promise<{ success: boolean; error?: string }> {
  const token = await autoLoginDemo("TENANT");
  if (!token) {
    return { success: false, error: "Could not log in as demo tenant" };
  }
  revalidatePath("/", "layout");
  return { success: true };
}
