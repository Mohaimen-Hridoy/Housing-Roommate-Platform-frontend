import { Badge } from "@/components/ui/badge";
import {
  BOOKING_STATUS_META,
  PAYMENT_STATUS_META,
  PROPERTY_STATUS_META,
  ROLE_META,
  ROOM_STATUS_META,
  type StatusMeta,
  type Tone,
} from "@/lib/constants";
import { humanize } from "@/lib/utils";
import type { BookingStatus, PaymentStatus, PropertyStatus, Role, RoomStatus } from "@/lib/types/api";

const VARIANT_BY_TONE: Record<Tone, "default" | "secondary" | "success" | "warning" | "danger" | "info" | "accent" | "outline"> = {
  neutral: "secondary",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  accent: "accent",
};

interface StatusBadgeProps {
  meta: StatusMeta | undefined;
  fallback: string;
  title?: string;
  className?: string;
}

function StatusBadge({ meta, fallback, title, className }: StatusBadgeProps) {
  const label = meta?.label ?? humanize(fallback);
  return (
    <Badge variant={VARIANT_BY_TONE[meta?.tone ?? "neutral"]} title={title ?? meta?.description} className={className}>
      {label}
    </Badge>
  );
}

interface BadgeWrapperProps {
  className?: string;
}

export function PropertyStatusBadge({ status, className }: { status: PropertyStatus } & BadgeWrapperProps) {
  return <StatusBadge meta={PROPERTY_STATUS_META[status]} fallback={status} className={className} />;
}

export function RoomStatusBadge({ status, className }: { status: RoomStatus } & BadgeWrapperProps) {
  return <StatusBadge meta={ROOM_STATUS_META[status]} fallback={status} className={className} />;
}

export function BookingStatusBadge({ status, className }: { status: BookingStatus } & BadgeWrapperProps) {
  return <StatusBadge meta={BOOKING_STATUS_META[status]} fallback={status} className={className} />;
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus } & BadgeWrapperProps) {
  return <StatusBadge meta={PAYMENT_STATUS_META[status]} fallback={status} className={className} />;
}

export function RoleBadge({ role, className }: { role: Role } & BadgeWrapperProps) {
  return <StatusBadge meta={ROLE_META[role]} fallback={role} className={className} />;
}

export { StatusBadge };
