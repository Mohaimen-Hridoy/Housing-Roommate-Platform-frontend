/**
 * Domain types mirroring the B7A6 backend (`Housing-Roommate-Platform-backend`).
 * Every response is wrapped in the uniform `ApiResponse<T>` envelope defined in
 * the backend's `src/common/apiResponse.ts`.
 */

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseMeta {
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

export interface ApiFieldError {
  path?: (string | number)[];
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors?: ApiFieldError[];
  meta?: ApiResponseMeta;
  error?: { code?: string; details?: unknown } | null;
}

/* ------------------------------------------------------------------ enums */

export type Role = "ADMIN" | "OWNER" | "TENANT";
export type PropertyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type RoomStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE";
export type RoomFacing = "NORTH" | "SOUTH" | "EAST" | "WEST";
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED";
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "CANCELED";
export type PaymentProvider = "STRIPE" | "MOCK";
export type ReviewSubject = "ROOM" | "PROPERTY";

export const CURRENCIES = [
  "usd",
  "eur",
  "gbp",
  "cad",
  "aud",
  "jpy",
  "chf",
  "cny",
  "sek",
  "nzd",
] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

/* ----------------------------------------------------------------- models */

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export interface User extends SessionUser {
  phone: string | null;
  image: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer" | string;
  expiresIn: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImageAsset {
  id: string;
  url: string;
  publicId: string;
  storage: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  mimeType?: string | null;
  position: number;
  isPrimary: boolean;
  propertyId?: string;
  roomId?: string;
}

export interface PropertySummary {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  status: PropertyStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  amenities: Amenity[];
}

export interface RoomSummary {
  id: string;
  title: string;
  rent: number;
  currency: string;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  images: ImageAsset[];
}

export interface PropertyDetail extends PropertySummary {
  rooms: RoomSummary[];
  images: ImageAsset[];
}

export interface PropertyListItem extends PropertySummary {
  rooms?: RoomSummary[];
  images?: ImageAsset[];
}

export interface Room {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  area: number | null;
  rent: number;
  currency: string;
  deposit: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  facing: RoomFacing | null;
  availableFrom: string | null;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  property?: { id: string; title: string; city: string; status?: PropertyStatus };
}

export interface RoomListItem extends Room {
  property: { id: string; title: string; city: string };
}
export interface RoomOccupancy {
  id: string;
  title: string;
  status: RoomStatus;
  bookings: {
    id: string;
    tenant: { id: string; name: string | null };
    startDate: string;
    endDate: string | null;
    status: BookingStatus;
  }[];
}

export interface BookingPaymentSummary {
  id: string;
  status: PaymentStatus;
}

export interface Booking {
  id: string;
  tenantId: string;
  roomId: string;
  propertyId: string;
  status: BookingStatus;
  startDate: string;
  endDate: string | null;
  nightlyRate: number;
  currency: string;
  totalAmount: number;
  platformFee: number;
  payment: BookingPaymentSummary | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  tenantId: string;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** Stripe PaymentIntent client secret. Selected on `GET /bookings/:id`; drives the Payment Element. */
  clientSecret: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: { property: { ownerId: string } };
}

export interface CheckoutSession {
  provider: PaymentProvider;
  status: PaymentStatus;
  clientSecret: string | null;
  checkoutUrl?: string;
  amount: number;
  currency: string;
}

export interface CheckoutReturnStatus {
  bookingId: string;
  outcome: "success" | "cancel";
  bookingStatus: BookingStatus;
  roomStatus: RoomStatus;
  paymentStatus: PaymentStatus | null;
  paymentProvider: PaymentProvider | null;
  message: string;
}

export interface Review {
  id: string;
  subject: ReviewSubject;
  reviewableId: string;
  authorId: string;
  bookingId: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string | null };
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: { id: string; title: string; city: string; status: PropertyStatus };
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string | null;
  body: string;
  propertyId: string | null;
  readAt: string | null;
  createdAt: string;
  sender?: { id: string; name: string | null };
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string | null;
  entityId: string | null;
  entityType: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  actor?: { id: string; email: string; role: Role } | null;
}

export interface ImageUploadLimits {
  allowedMimeTypes: string[];
}

/* --------------------------------------------------------- admin analytics */

export interface AdminStats {
  window: { days: number; since: string };
  users: { total: number; verified: number; newInWindow: number; byRole: Partial<Record<Role, number>> };
  properties: { total: number; published: number; byStatus: Record<string, number> };
  rooms: { total: number; byStatus: Record<string, number>; occupancyRate: number };
  bookings: {
    total: number;
    approved: number;
    newInWindow: number;
    byStatus: Record<string, number>;
    approvalRate: number;
  };
  payments: {
    total: number;
    byStatus: Record<string, number>;
    grossRevenue: number;
    platformFeeEarned: number;
    revenueInWindow: number;
  };
  engagement: { reviews: number; averageRating: number; favorites: number; messages: number };
  activity: { auditLogs: number };
  topProperties: { id: string; title: string; city: string; bookings: number; favorites: number }[];
  topCities: { city: string; properties: number }[];
}

export interface OwnerDashboard {
  window: { days: number; since: string };
  listings: {
    properties: number;
    rooms: number;
    byRoomStatus: Record<string, number>;
    occupancyRate: number;
    availableRooms: number;
  };
  bookings: { pending: number; newInWindow: number; byStatus: Record<string, number> };
  earnings: { gross: number; platformFee: number };
  recentBookings: {
    id: string;
    status: BookingStatus;
    totalAmount: number;
    currency: string;
    createdAt: string;
    room: { title: string };
    tenant: { id: string; name: string | null; email: string };
  }[];
  topRooms: {
    id: string;
    title: string;
    rent: number;
    currency: string;
    status: RoomStatus;
    bookings: number;
  }[];
}

/* --------------------------------------------------------------- payloads */

export interface PropertyInput {
  title: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
  status?: PropertyStatus;
  amenities?: string[];
}

export interface RoomInput {
  title: string;
  description?: string;
  area?: number;
  rent: number;
  currency?: CurrencyCode;
  deposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  facing?: RoomFacing;
  availableFrom?: string;
  status?: RoomStatus;
}

export interface BookingInput {
  roomId: string;
  startDate: string;
  endDate: string;
  message?: string;
}

export interface ReviewInput {
  subject: ReviewSubject;
  reviewableId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface MessageInput {
  recipientId: string;
  subject?: string;
  body: string;
  propertyId?: string;
}
