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
  /**
   * Called with 0–100 as a `multipart/form-data` body is sent. Only available
   * when `formData` is set, because that request is issued over `XMLHttpRequest`
   * rather than `fetch` — `fetch` has no upload progress event.
   */
  onUploadProgress?: (percent: number) => void;
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

interface RawResponse {
  status: number;
  ok: boolean;
  text: string;
}

/**
 * Issues a multipart request over `XMLHttpRequest`.
 *
 * The only reason this exists is upload progress: `fetch` cannot report bytes
 * sent, so anything with a `FormData` body and an `onUploadProgress` callback
 * takes this path. The response shape matches `fetch` so the caller can share one
 * parsing path.
 */
function sendWithProgress(
  url: string,
  formData: FormData,
  options: ClientRequestOptions,
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(options.method ?? "POST", url, true);
    request.withCredentials = true;
    request.setRequestHeader("Accept", "application/json");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) return;
      options.onUploadProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    request.onload = () => {
      resolve({ status: request.status, ok: request.status >= 200 && request.status < 300, text: request.responseText });
    };

    request.onerror = () =>
      reject(new ClientApiError("Network error — is the backend API reachable?", 0));

    const abort = () => request.abort();
    if (options.signal) {
      if (options.signal.aborted) {
        abort();
        return;
      }
      options.signal.addEventListener("abort", abort, { once: true });
    }

    request.send(formData);
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
  const url = `${PROXY_PREFIX}${path}${buildQuery(options.query)}`;
  let body: BodyInit | undefined;

  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  let status: number;
  let ok: boolean;
  let text: string;

  if (options.formData && options.onUploadProgress) {
    // Report 100% once the body is out; the response may still be in flight.
    try {
      const raw = await sendWithProgress(url, options.formData, options);
      status = raw.status;
      ok = raw.ok;
      text = raw.text;
      options.onUploadProgress(100);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw error;
    }
  } else {
    let response: Response;
    try {
      response = await fetch(url, {
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
    status = response.status;
    ok = response.ok;
    text = await response.text();
  }

  let payload: ApiResponse<T> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>;
    } catch {
      payload = null;
    }
  }

  if (!ok || !payload?.success) {
    throw new ClientApiError(
      payload?.message ?? `Request failed with status ${status}`,
      status,
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

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Safe wrapper that never throws — used by pages that render partial data with an error banner. */
export async function apiListSafe<T>(
  path: string,
  options: ClientRequestOptions = {},
): Promise<{ items: T[]; pagination: PaginationMeta; error: string | null }> {
  try {
    const result = await apiClient<{ items: T[]; pagination: PaginationMeta }>(path, options);
    return { items: result.data.items, pagination: result.data.pagination, error: null };
  } catch (error) {
    return {
      items: [],
      pagination: EMPTY_PAGINATION,
      error: error instanceof Error ? error.message : "Unable to load data",
    };
  }
}

/** Turns any thrown value into a toast-friendly message. */
export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ClientApiError || error instanceof Error) return error.message || fallback;
  return fallback;
}
