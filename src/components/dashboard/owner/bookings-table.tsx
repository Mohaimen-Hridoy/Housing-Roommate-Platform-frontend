"use client";

import { Check, Inbox, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOwnerMutation } from "@/components/dashboard/owner/use-owner-mutation";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types/api";

export interface TenantInfo {
  name: string | null;
  email: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  /** Tenant details resolved from the owner dashboard payload (max 5 recent bookings). */
  tenants: Record<string, TenantInfo>;
}

type PendingDecision = { booking: Booking; next: Extract<BookingStatus, "APPROVED" | "REJECTED"> } | null;

/** Owner booking queue with guarded approve / reject and optimistic status updates. */
export function BookingsTable({ bookings, tenants }: BookingsTableProps) {
  const { pendingKey, run } = useOwnerMutation();
  const [rows, setRows] = useState<Booking[]>(bookings);
  const [decision, setDecision] = useState<PendingDecision>(null);

  const decide = async () => {
    if (!decision) return;
    const { booking, next } = decision;
    const previous = rows;
    setRows(rows.map((entry) => (entry.id === booking.id ? { ...entry, status: next } : entry)));

    const path = next === "APPROVED" ? `/bookings/${booking.id}/approve` : `/bookings/${booking.id}/reject`;
    const updated = await run<Booking>(`booking-${booking.id}`, path, {
      method: "PATCH",
      body: {},
      successMessage:
        next === "APPROVED"
          ? "Booking approved — the room is now occupied and the payment moved to processing."
          : "Booking rejected — the room is available again.",
    });

    if (!updated) {
      setRows(previous);
      setDecision(null);
      return;
    }

    setRows(rows.map((entry) => (entry.id === updated.id ? { ...updated, payment: updated.payment ?? entry.payment } : entry)));
    setDecision(null);
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No booking requests match this view"
        description="Change the status filter, or wait for tenants to request one of your rooms."
        action={{ label: "Clear filters", href: "/owner/bookings" }}
      />
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead className="hidden lg:table-cell">Stay</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden md:table-cell text-right">Platform fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden xl:table-cell">Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((booking) => {
              const tenant = tenants[booking.tenantId];
              const isPending = booking.status === "PENDING";
              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-medium">{tenant?.name ?? "Tenant"}</p>
                    {tenant ? (
                      <p className="text-xs text-muted-foreground">{tenant.email}</p>
                    ) : (
                      <p className="font-mono text-xs text-muted-foreground" title={booking.tenantId}>
                        id: {booking.tenantId}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">{formatRelative(booking.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/owner/listings/${booking.propertyId}`}
                      className="text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
                    >
                      Manage listing
                    </Link>
                    <p className="font-mono text-[11px] text-muted-foreground" title={`Room ${booking.roomId}`}>
                      room: {booking.roomId.slice(0, 8)}…
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDate(booking.startDate)} → {booking.endDate ? formatDate(booking.endDate) : "open-ended"}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular-nums text-muted-foreground md:table-cell">
                    {formatCurrency(booking.platformFee, booking.currency)}
                  </TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {booking.payment ? (
                      <PaymentStatusBadge status={booking.payment.status} />
                    ) : (
                      <span className="text-xs text-muted-foreground">No payment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isPending ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="success"
                          onClick={() => setDecision({ booking, next: "APPROVED" })}
                        >
                          <Check />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDecision({ booking, next: "REJECTED" })}
                        >
                          <X />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <p className="text-right text-xs text-muted-foreground">Decided</p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={decision !== null}
        onOpenChange={(open) => {
          if (!open) setDecision(null);
        }}
        title={decision?.next === "APPROVED" ? "Approve this booking?" : "Reject this booking?"}
        description={
          decision?.next === "APPROVED"
            ? "The room becomes occupied and the tenant's payment moves to processing (Stripe) or is marked paid in mock mode."
            : "The booking is declined and the room returns to available."
        }
        confirmLabel={decision?.next === "APPROVED" ? "Approve booking" : "Reject booking"}
        destructive={decision?.next === "REJECTED"}
        loading={decision !== null && pendingKey === `booking-${decision.booking.id}`}
        onConfirm={decide}
      />
    </>
  );
}
