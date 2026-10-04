"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, nightsBetween } from "@/lib/format";
import type { Booking, RoomStatus } from "@/lib/types/api";

import { CancelBookingButton } from "@/components/dashboard/tenant/cancel-booking-button";

export interface TenantBookingRow {
  booking: Booking;
  propertyTitle: string | null;
  propertyCity: string | null;
  roomTitle: string | null;
  roomStatus: RoomStatus | null;
}

function canCancel(status: Booking["status"]): boolean {
  return status === "PENDING" || status === "APPROVED";
}

/**
 * Booking table with an optimistic cancel: the row disappears as soon as the
 * request starts and is restored if the API rejects the cancellation.
 */
export function BookingsTable({ initialRows }: { initialRows: TenantBookingRow[] }) {
  const [rows, setRows] = useState(initialRows);

  const restoreRow = (row: TenantBookingRow) => {
    setRows((current) =>
      current.some((entry) => entry.booking.id === row.booking.id) ? current : [...current, row],
    );
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No bookings match this view"
        description="Adjust the filters above, or find a room to book from the public listings."
        action={{ label: "Browse rooms", href: "/properties" }}
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Stay</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const { booking } = row;
              const nights = booking.endDate ? nightsBetween(booking.startDate, booking.endDate) : 0;

              return (
                <TableRow key={booking.id}>
                  <TableCell className="max-w-[16rem]">
                    <p className="truncate font-medium">{row.propertyTitle ?? "Property unavailable"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.roomTitle ?? `Room ${booking.roomId.slice(0, 8)}`}
                      {row.propertyCity ? ` · ${row.propertyCity}` : ""}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="whitespace-nowrap text-sm">
                      {formatDate(booking.startDate, "d MMM yy")} → {formatDate(booking.endDate, "d MMM yy")}
                    </p>
                    <p className="text-xs text-muted-foreground">{nights} night{nights === 1 ? "" : "s"}</p>
                  </TableCell>

                  <TableCell>
                    <p className="whitespace-nowrap font-medium tabular-nums">
                      {formatCurrency(booking.totalAmount, booking.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fee {formatCurrency(booking.platformFee, booking.currency)}
                    </p>
                  </TableCell>

                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>

                  <TableCell>
                    {booking.payment ? (
                      <PaymentStatusBadge status={booking.payment.status} />
                    ) : (
                      <span className="text-xs text-muted-foreground">No payment record</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          Details
                          <ArrowRight />
                        </Link>
                      </Button>
                      {canCancel(booking.status) ? (
                        <CancelBookingButton
                          bookingId={booking.id}
                          onCancelled={() => setRows((current) => current.filter((entry) => entry.booking.id !== booking.id))}
                          onRollback={() => restoreRow(row)}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}