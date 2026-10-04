import "server-only";

import { API_URL } from "@/lib/config";
import { readAccessToken, readRefreshToken, writeAccessToken } from "@/lib/auth/session";
import type {
  ApiFieldError,
  ApiResponse,
  ApiResponseMeta,
  AuthTokens,
  PaginationMeta,
} from "@/lib/types/api";

/** Normalised error thrown by every server-side API call. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors: ApiFieldError[];

  constructor(message: string, status: number, fieldErrors: ApiFieldError[] = [], code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** Field-name → message map, ready to feed into react-hook-form. */
  get formErrors(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const issue of this.fieldErrors) {
      const key = issue.path?.join(".") ?? "root";
      if (!map[key]) map[key] = issue.message;
    }
    return map;
  }
}

export type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Multipart upload — mutually exclusive with `body`. */
  formData?: FormData;
  /** Opt out of the Authorization header (public endpoints only). */
  anonymous?: boolean;
  revalidate?: number | false;
  tags?: string[];
}

export interface ApiResult<T> {
  data: T;
  meta?: ApiResponseMeta;
  message: string;
}

export function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const serialised = params.toString();
  return serialised ? `?${serialised}` : "";
}

function toFieldErrors(errors: unknown): ApiFieldError[] {
  if (!Array.isArray(errors)) return [];
  return errors.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as { path?: unknown; message?: unknown; field?: unknown };
    const path = Array.isArray(candidate.path)
      ? candidate.path.map(String)
      : typeof candidate.field === "string"
        ? [candidate.field]
        : undefined;
    const message = typeof candidate.message === "string" ? candidate.message : "Invalid value";
    return [{ path, message }];
  });
}

/** Exchange the rotating refresh token for a fresh access token. */
async function refreshAccessToken(): Promise<AuthTokens | null> {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiResponse<AuthTokens>;
    if (!payload.success || !payload.data?.accessToken) return null;
    await writeAccessToken(payload.data.accessToken, payload.data.expiresIn ?? 900);
    return payload.data;
  } catch {
    return null;
  }
}

async function performRequest<T>(
  path: string,
  options: ApiRequestOptions,
  token: string | null,
): Promise<ApiResult<T>> {
  const headers = new Headers({ Accept: "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const method = options.method ?? "GET";
  // Authenticated responses are per-user, so they are never shared through the
  // Next.js data cache. Only anonymous reads may be revalidated/cached.
  const isCacheable = method === "GET" && !token && options.revalidate !== false;

  const response = await fetch(`${API_URL}${path}${buildQuery(options.query)}`, {
    method,
    headers,
    body,
    ...(isCacheable
      ? { next: { revalidate: options.revalidate ?? 30, tags: options.tags } }
      : { cache: "no-store" as const }),
  });

  const text = await response.text();
  let payload: ApiResponse<T> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok || !payload?.success) {
    throw new ApiRequestError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
      toFieldErrors(payload?.errors ?? payload?.error?.details),
      payload?.error?.code,
    );
  }

  return {
    data: (payload.data ?? null) as T,
    meta: payload.meta ?? undefined,
    message: payload.message ?? "Success",
  };
}

/**
 * Server-side call to the backend. Reads the access token from the httpOnly
 * cookie, transparently refreshes it once on a 401, and normalises failures
 * into `ApiRequestError`.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResult<T>> {
  const token = options.anonymous ? null : await readAccessToken();

  try {
    return await performRequest<T>(path, options, token);
  } catch (error) {
    const isAuthFailure = error instanceof ApiRequestError && error.status === 401;
    if (!isAuthFailure || options.anonymous) throw error;

    const refreshed = await refreshAccessToken();
    if (!refreshed) throw error;
    return performRequest<T>(path, options, refreshed.accessToken);
  }
}

/** Convenience wrapper returning only the `data` payload. */
export async function apiData<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const result = await apiRequest<T>(path, options);
  return result.data;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

/** Convenience wrapper for the backend's paginated list endpoints. */
export async function apiList<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Paginated<T>> {
  const result = await apiRequest<T[]>(path, options);
  return {
    items: result.data ?? [],
    pagination: result.meta?.pagination ?? EMPTY_PAGINATION,
  };
}

/** Never throws — used by pages that render partial data with an error banner. */
export async function apiListSafe<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<{ items: T[]; pagination: PaginationMeta; error: string | null }> {
  try {
    const result = await apiList<T>(path, options);
    return { ...result, error: null };
  } catch (error) {
    return {
      items: [],
      pagination: EMPTY_PAGINATION,
      error: error instanceof Error ? error.message : "Unable to load data",
    };
  }
}

/** Never throws — for optional widgets. */
export async function apiDataSafe<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await apiData<T>(path, options);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unable to load data" };
  }
}
