/** Server-only configuration for talking to the B7A6 backend. */
const rawBase = process.env.API_BASE_URL ?? "http://localhost:4000";

export const API_BASE_URL = rawBase.replace(/\/+$/, "");

export const API_PREFIX = "/api/v1";

/** Absolute base of the versioned API, e.g. `http://localhost:4000/api/v1`. */
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** Internal proxy mount point used by every browser-side request. */
export const PROXY_PREFIX = "/api/proxy";

export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;
