import "server-only";

import { apiData, apiList, apiRequest, type ApiRequestOptions } from "@/lib/api/server";
import type {
  AdminStats,
  Amenity,
  AuditLog,
  AuthTokens,
  Booking,
  CheckoutReturnStatus,
  CheckoutSession,
  Favorite,
  ImageAsset,
  ImageUploadLimits,
  Message,
  OwnerDashboard,
  Payment,
  PropertyDetail,
  PropertyInput,
  PropertyListItem,
  Review,
  Room,
  RoomInput,
  RoomListItem,
  RoomOccupancy,
  SessionUser,
  User,
} from "@/lib/types/api";

type Opts = Omit<ApiRequestOptions, "query" | "method" | "body" | "formData">;

/* ------------------------------------------------------------------ auth */

export const authApi = {
  login: (body: { email: string; password: string }) =>
    apiData<AuthTokens>("/auth/login", { method: "POST", body, anonymous: true }),
  registerTenant: (body: { name: string; email: string; password: string; phone?: string }) =>
    apiData<AuthTokens>("/auth/register/tenant", { method: "POST", body, anonymous: true }),
  registerOwner: (body: { name: string; email: string; password: string; phone?: string }) =>
    apiData<AuthTokens>("/auth/register/owner", { method: "POST", body, anonymous: true }),
  logout: () => apiData<null>("/auth/logout", { method: "POST" }),
  me: (): Promise<SessionUser> => apiData<SessionUser>("/auth/me"),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiData<null>("/auth/password/change", { method: "PATCH", body }),
  forgotPassword: (email: string) =>
    apiData<null>("/auth/password/forgot", { method: "POST", body: { email }, anonymous: true }),
  resetPassword: (body: { token: string; password: string }) =>
    apiData<null>("/auth/password/reset", { method: "POST", body, anonymous: true }),
  verifyEmail: (token: string) =>
    apiData<null>("/auth/verify", { method: "POST", body: { token }, anonymous: true }),
  resendVerification: (email: string) =>
    apiData<null>("/auth/verify/resend", { method: "POST", body: { email }, anonymous: true }),
};

/* ------------------------------------------------------------ properties */

export const propertyApi = {
  list: (query: Record<string, string | number | boolean | undefined>, options: Opts = {}) =>
    apiList<PropertyListItem>("/properties", { ...options, query: { ...query, published: true } }),
  adminList: (query: Record<string, string | number | boolean | undefined>, options: Opts = {}) =>
    apiList<PropertyListItem>("/properties", { ...options, query }),
  ownerList: (ownerId: string, query: Record<string, string | number | undefined>, options: Opts = {}) =>
    apiList<PropertyListItem>("/properties", { ...options, query: { ...query, ownerId } }),
  detail: (id: string, options: Opts = {}) =>
    apiData<PropertyDetail>(`/properties/${id}`, { ...options, anonymous: true }),
  create: (body: PropertyInput) => apiData<PropertyDetail>("/properties", { method: "POST", body }),
  update: (id: string, body: Partial<PropertyInput>) =>
    apiData<PropertyDetail>(`/properties/${id}`, { method: "PATCH", body }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/properties/${id}`, { method: "DELETE" }),
  attachAmenity: (propertyId: string, amenityId: string) =>
    apiData<unknown>(`/properties/${propertyId}/amenities`, { method: "POST", body: { amenityId } }),
  detachAmenity: (propertyId: string, amenityId: string) =>
    apiData<unknown>(`/properties/${propertyId}/amenities/${amenityId}`, { method: "DELETE" }),
  images: (propertyId: string, options: Opts = {}) =>
    apiData<ImageAsset[]>(`/properties/${propertyId}/images`, { ...options, anonymous: true }),
  uploadImages: (propertyId: string, formData: FormData) =>
    apiData<ImageAsset[]>(`/properties/${propertyId}/images`, { method: "POST", formData }),
};

/* ---------------------------------------------------------------- rooms */

export const roomApi = {
  search: (query: Record<string, string | number | undefined>, options: Opts = {}) =>
    apiList<RoomListItem>("/rooms", { ...options, query, anonymous: true }),
  forProperty: (propertyId: string, options: Opts = {}) =>
    apiList<RoomListItem>(`/properties/${propertyId}/rooms`, { ...options, anonymous: true }),
  detail: (id: string, options: Opts = {}) => apiData<Room>(`/rooms/${id}`, { ...options, anonymous: true }),
  create: (propertyId: string, body: RoomInput) =>
    apiData<Room>(`/properties/${propertyId}/rooms`, { method: "POST", body }),
  update: (id: string, body: Partial<RoomInput>) => apiData<Room>(`/rooms/${id}`, { method: "PATCH", body }),
  setStatus: (id: string, status: string) => apiData<Room>(`/rooms/${id}/status`, { method: "PATCH", body: { status } }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/rooms/${id}`, { method: "DELETE" }),
  occupancy: (id: string, options: Opts = {}) =>
    apiData<RoomOccupancy>(`/rooms/${id}/occupancy`, { ...options, anonymous: true }),
  images: (id: string, options: Opts = {}) => apiData<ImageAsset[]>(`/rooms/${id}/images`, { ...options, anonymous: true }),
  uploadImages: (id: string, formData: FormData) =>
    apiData<ImageAsset[]>(`/rooms/${id}/images`, { method: "POST", formData }),
};

/* ------------------------------------------------------------- bookings */

export const bookingApi = {
  list: (
    query: Record<string, string | number | undefined>,
    options: Opts = {},
  ) => apiList<Booking>("/bookings", { ...options, query }),
  mine: (query: Record<string, string | number | undefined> = {}, options: Opts = {}) =>
    apiList<Booking>("/bookings/mine", { ...options, query }),
  detail: (id: string, options: Opts = {}) => apiData<Booking>(`/bookings/${id}`, { ...options }),
  create: (body: { roomId: string; startDate: string; endDate: string; message?: string }) =>
    apiData<Booking>("/bookings", { method: "POST", body }),
  approve: (id: string, endDate?: string) =>
    apiData<Booking>(`/bookings/${id}/approve`, { method: "PATCH", body: endDate ? { endDate } : {} }),
  reject: (id: string) => apiData<Booking>(`/bookings/${id}/reject`, { method: "PATCH", body: {} }),
  cancel: (id: string, reason?: string) =>
    apiData<Booking>(`/bookings/${id}/cancel`, { method: "PATCH", body: { reason } }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/bookings/${id}`, { method: "DELETE" }),
  checkout: (id: string) => apiData<CheckoutSession>(`/bookings/${id}/checkout`, { method: "POST" }),
  checkoutReturn: (id: string, outcome: "success" | "cancel") =>
    apiData<CheckoutReturnStatus>(`/bookings/${id}/${outcome}`, { anonymous: true }),
  payments: (id: string, options: Opts = {}) =>
    apiData<Payment[]>(`/bookings/${id}/payments`, { ...options }),
};

/* ------------------------------------------------------------- payments */

export const paymentApi = {
  list: (query: Record<string, string | number | undefined>, options: Opts = {}) =>
    apiList<Payment>("/payments", { ...options, query }),
  detail: (id: string, options: Opts = {}) => apiData<Payment>(`/payments/${id}`, { ...options }),
  refund: (id: string, amount?: number) =>
    apiData<Payment>(`/payments/${id}/refund`, { method: "POST", body: { amount } }),
};

/* -------------------------------------------------------------- reviews */

export const reviewApi = {
  list: (query: Record<string, string | number | undefined> = {}, options: Opts = {}) =>
    apiList<Review>("/reviews", { ...options, query, anonymous: true }),
  forSubject: (subject: "ROOM" | "PROPERTY", reviewableId: string) =>
    apiList<Review>("/reviews", { query: { subject, reviewableId, sortBy: "rating", sortOrder: "desc" }, anonymous: true }),
  create: (body: { subject: "ROOM" | "PROPERTY"; reviewableId: string; bookingId: string; rating: number; comment?: string }) =>
    apiData<Review>("/reviews", { method: "POST", body }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/reviews/${id}`, { method: "DELETE" }),
};

/* ------------------------------------------------------------ favorites */

export const favoriteApi = {
  list: (query: Record<string, string | number | undefined> = {}, options: Opts = {}) =>
    apiList<Favorite>("/favorites", { ...options, query }),
  add: (propertyId: string) => apiData<Favorite>("/favorites", { method: "POST", body: { propertyId } }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/favorites/${id}`, { method: "DELETE" }),
  removeByProperty: (propertyId: string) =>
    apiData<{ id: string; deleted: boolean }>(`/favorites/property/${propertyId}`, { method: "DELETE" }),
};

/* ------------------------------------------------------------- messages */

export const messageApi = {
  list: (query: Record<string, string | number | boolean | undefined>, options: Opts = {}) =>
    apiList<Message>("/messages", { ...options, query }),
  conversation: (otherUserId: string, options: Opts = {}) =>
    apiData<Message[]>(`/messages/conversation/${otherUserId}`, { ...options }),
  send: (body: { recipientId: string; subject?: string; body: string; propertyId?: string }) =>
    apiData<Message>("/messages", { method: "POST", body }),
  markRead: (id: string) => apiData<Message>(`/messages/${id}/read`, { method: "PATCH", body: {} }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/messages/${id}`, { method: "DELETE" }),
};

/* ------------------------------------------------------------ amenities */

export const amenityApi = {
  list: (query: Record<string, string | number | undefined> = {}, options: Opts = {}) =>
    apiList<Amenity>("/amenities", { ...options, query: { ...query, pageSize: 100, sortBy: "name", sortOrder: "asc" }, anonymous: true }),
  create: (body: { name: string; icon?: string }) => apiData<Amenity>("/amenities", { method: "POST", body }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/amenities/${id}`, { method: "DELETE" }),
};

/* --------------------------------------------------------------- images */

export const imageApi = {
  limits: () => apiData<ImageUploadLimits>("/images/upload-limits", { anonymous: true }),
  setPrimary: (id: string) => apiData<ImageAsset>(`/images/${id}/primary`, { method: "PATCH", body: {} }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/images/${id}`, { method: "DELETE" }),
};

/* ---------------------------------------------------------------- users */

export const userApi = {
  list: (query: Record<string, string | number | boolean | undefined>, options: Opts = {}) =>
    apiList<User>("/users", { ...options, query }),
  detail: (id: string, options: Opts = {}) => apiData<User>(`/users/${id}`, { ...options }),
  update: (id: string, body: { name?: string; phone?: string; role?: string }) =>
    apiData<User>(`/users/${id}`, { method: "PATCH", body }),
  setRole: (id: string, role: string) => apiData<User>(`/users/${id}/role`, { method: "PATCH", body: { role } }),
  setPassword: (id: string, password: string) =>
    apiData<null>(`/users/${id}/password`, { method: "PATCH", body: { password } }),
  remove: (id: string) => apiData<{ id: string; deleted: boolean }>(`/users/${id}`, { method: "DELETE" }),
  restore: (id: string) => apiData<{ id: string; restored: boolean }>(`/users/${id}/restore`, { method: "PATCH" }),
};

/* ----------------------------------------------------------------- admin */

export const adminApi = {
  stats: (days?: number, options: Opts = {}) =>
    apiRequest<AdminStats>("/admin/stats", { ...options, query: { days } }),
  ownerDashboard: (options: Opts = {}) => apiRequest<OwnerDashboard>("/dashboard", options),
};

/* ----------------------------------------------------------------- audit */

export const auditApi = {
  list: (query: Record<string, string | number | undefined>, options: Opts = {}) =>
    apiList<AuditLog>("/audit/logs", { ...options, query }),
  detail: (id: string, options: Opts = {}) => apiData<AuditLog>(`/audit/logs/${id}`, { ...options }),
};

/* ---------------------------------------------------------------- health */

export const healthApi = {
  check: () =>
    apiData<{ status: string; uptime?: number; timestamp?: string; database?: string }>("/health", {
      anonymous: true,
      revalidate: 15,
    }),
};
