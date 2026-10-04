"use client";

import { PROXY_PREFIX } from "@/lib/config";
import type { ApiFieldError, ApiResponse, ApiResponseMeta } from "@/lib/types/api";

/** Client-side error carrying the backend's field-level validation messages. */
export class ClientApiError extends Error {
  readonly status: number;
  readonly fieldErrors: ApiFieldError[];

  constructor(message: string, status: number, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = "ClientApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get formErrors(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const issue of this.fieldErrors) {
      const key = issue.path?.join(".") ?? "root";
      if (!map[key]) map[key] = issue.message;
    }
    return map;
  }
}

export type ClientQueryValue = string | number | boolean | null | undefined;

export interface ClientRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, ClientQueryValue>;
  body?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
}

export interface ClientResult<T> {
  data: T;
  meta?: ApiResponseMeta;
  message: string;
}

function buildQuery(query?: Record<string, ClientQueryValue>): string {
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

/**
 * All browser traffic goes through the internal `/api/proxy` route, which
 * attaches the httpOnly access token server-side. That keeps the token out of
 * JavaScript and removes any CORS dependency on the backend.
 */
export async function apiClient<T>(
  path: string,
  options: ClientRequestOptions = {},
): Promise<ClientResult<T>> {
  const headers = new Headers({ Accept: "application/json" });
  let body: BodyInit | undefined;

  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(`${PROXY_PREFIX}${path}${buildQuery(options.query)}`, {
      method: options.method ?? "GET",
      headers,
      body,
      signal: options.signal,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ClientApiError("Network error — is the backend API reachable?", 0);
  }

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
    throw new ClientApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
      toFieldErrors(payload?.errors ?? payload?.error?.details),
    );
  }

  return { data: (payload.data ?? null) as T, meta: payload.meta ?? undefined, message: payload.message ?? "Success" };
}

export async function apiClientData<T>(
  path: string,
  options: ClientRequestOptions = {},
): Promise<T> {
  const result = await apiClient<T>(path, options);
  return result.data;
}

/** Turns any thrown value into a toast-friendly message. */
export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ClientApiError || error instanceof Error) return error.message || fallback;
  return fallback;
}
