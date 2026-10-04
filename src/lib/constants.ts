import type {
  BookingStatus,
  PaymentStatus,
  PropertyStatus,
  Role,
  RoomFacing,
  RoomStatus,
} from "@/lib/types/api";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

export interface StatusMeta {
  label: string;
  tone?: Tone;
  description?: string;
}

export const ROLE_META: Record<Role, StatusMeta> = {
  ADMIN: { label: "Admin", tone: "danger", description: "Full platform access" },
  OWNER: { label: "Owner", tone: "info", description: "Lists properties and approves bookings" },
  TENANT: { label: "Tenant", tone: "accent", description: "Books rooms and manages payments" },
};

export const PROPERTY_STATUS_META: Record<PropertyStatus, StatusMeta> = {
  PUBLISHED: { label: "Published", tone: "success", description: "Visible in public search" },
  DRAFT: { label: "Draft", tone: "warning", description: "Only visible to the owner" },
  ARCHIVED: { label: "Archived", tone: "neutral", description: "Removed from search" },
};

export const ROOM_STATUS_META: Record<RoomStatus, StatusMeta> = {
  AVAILABLE: { label: "Available", tone: "success" },
  RESERVED: { label: "Reserved", tone: "warning" },
  OCCUPIED: { label: "Occupied", tone: "info" },
  MAINTENANCE: { label: "Maintenance", tone: "neutral" },
};

export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  PENDING: { label: "Pending", tone: "warning", description: "Waiting for the owner's decision" },
  APPROVED: { label: "Approved", tone: "success", description: "Room is occupied, payment is due" },
  REJECTED: { label: "Rejected", tone: "danger", description: "The owner declined this request" },
  CANCELLED: { label: "Cancelled", tone: "neutral", description: "Cancelled and the room was released" },
  EXPIRED: { label: "Expired", tone: "neutral", description: "The request expired before a decision" },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  PENDING: { label: "Pending", tone: "warning" },
  PROCESSING: { label: "Processing", tone: "info" },
  SUCCEEDED: { label: "Paid", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
  PARTIALLY_REFUNDED: { label: "Partially refunded", tone: "warning" },
  CANCELED: { label: "Canceled", tone: "neutral" },
};

export const FACING_META: Record<RoomFacing, StatusMeta> = {
  NORTH: { label: "North" },
  SOUTH: { label: "South" },
  EAST: { label: "East" },
  WEST: { label: "West" },
};

export const AUDIT_ACTIONS = [
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DELETED",
  "PROPERTY_CREATED",
  "PROPERTY_UPDATED",
  "PROPERTY_DELETED",
  "ROOM_CREATED",
  "ROOM_UPDATED",
  "ROOM_DELETED",
  "AMENITY_CREATED",
  "AMENITY_DELETED",
  "IMAGE_UPLOADED",
  "IMAGE_DELETED",
  "BOOKING_CREATED",
  "BOOKING_STATUS_CHANGED",
  "BOOKING_CANCELLED",
  "PAYMENT_CREATED",
  "PAYMENT_STATUS_CHANGED",
  "REVIEW_CREATED",
  "REVIEW_DELETED",
  "FAVORITE_CREATED",
  "FAVORITE_DELETED",
  "MESSAGE_SENT",
  "AUTH_LOGIN",
  "AUTH_LOGOUT",
  "AUTH_TOKEN_REFRESHED",
  "ROLE_ASSIGNED",
] as const;

export interface DemoAccount {
  role: Role;
  label: string;
  email: string;
  password: string;
  description: string;
  home: string;
}

/**
 * Seeded by the backend (`npm run db:seed`) and used by the one-click demo
 * login required by the assignment.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Admin",
    email: "admin@housing.local",
    password: "Admin1234!",
    description: "Platform analytics, user management, refunds and audit logs",
    home: "/admin",
  },
  {
    role: "OWNER",
    label: "Owner",
    email: "owner@housing.local",
    password: "Owner1234!",
    description: "Listings, room inventory, booking approvals and earnings",
    home: "/owner",
  },
  {
    role: "TENANT",
    label: "Tenant",
    email: "tenant@housing.local",
    password: "Tenant1234!",
    description: "Search rooms, book, pay with Stripe and leave reviews",
    home: "/dashboard",
  },
];

export function demoAccountForRole(role: Role): DemoAccount {
  const found = DEMO_ACCOUNTS.find((account) => account.role === role);
  if (!found) throw new Error(`No demo account configured for role ${role}`);
  return found;
}

/** Dashboard home + allowed area for each role, used by middleware and the UI. */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  OWNER: "/owner",
  TENANT: "/dashboard",
};

export const ROLE_AREA: Record<Role, string> = {
  ADMIN: "/admin",
  OWNER: "/owner",
  TENANT: "/dashboard",
};

export const APP_NAME = "NestSpace";
export const APP_TAGLINE = "Housing & Roommate Platform";
