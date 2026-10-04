"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Ban, Check, MoreHorizontal, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { ActiveFilterChips, FilterSelect, SortSelect } from "@/components/common/url-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient, errorMessage } from "@/lib/api/client";
import { BOOKING_STATUS_META } from "@/lib/constants";
import { formatCurrency, formatDate, nightsBetween } from "@/lib/format";
import type { Booking, BookingStatus, PaymentStatus } from "@/lib/types/api";

const STATUSES: BookingStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "EXPIRED"];

type ConfirmKind = "approve" | "reject" | "delete";

interface ConfirmState {
  kind: ConfirmKind;
  booking: Booking;
}

const cancelSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Give a short reason (at least 3 characters)")
    .max(240, "Keep the reason under 240 characters"),
});

type CancelValues = z.infer<typeof cancelSchema>;

interface BookingsViewProps {
  bookings: Booking[];
}

export function BookingsView({ bookings }: BookingsViewProps) {
  const router = useRouter();

  const [statusOverrides, setStatusOverrides] = useState<Record<string, BookingStatus>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const cancelForm = useForm<CancelValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    setStatusOverrides((previous) => {
      const next: Record<string, BookingStatus> = {};
      for (const [id, status] of Object.entries(previous)) {
        const match = bookings.find((booking) => booking.id === id);
        if (match && match.status !== status) next[id] = status;
      }
      return Object.keys(next).length === Object.keys(previous).length ? previous : next;
    });
  }, [bookings]);

  const statusOf = (booking: Booking): BookingStatus => statusOverrides[booking.id] ?? booking.status;

  const runBookingAction = async (booking: Booking, optimistic: BookingStatus, action: () => Promise<unknown>, successMessage: string) => {
    const previous = statusOf(booking);
    setStatusOverrides((current) => ({ ...current, [booking.id]: optimistic }));
    setBusyId(booking.id);
    try {
      await action();
      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      setStatusOverrides((current) => ({ ...current, [booking.id]: previous }));
      toast.error(errorMessage(error, "The booking could not be updated"));
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const approve = (booking: Booking) =>
    void runBookingAction(
      booking,
      "APPROVED",
      () => apiClient<Booking>(`/bookings/${booking.id}/approve`, { method: "PATCH", body: {} }),
      `${booking.id.slice(0, 8)} approved by admin override`,
    );

  const reject = (booking: Booking) =>
    void runBookingAction(
      booking,
      "REJECTED",
      () => apiClient<Booking>(`/bookings/${booking.id}/reject`, { method: "PATCH", body: {} }),
      `${booking.id.slice(0, 8)} rejected — the room was released`,
    );

  const remove = async () => {
    if (!confirm) return;
    const booking = confirm.booking;
    setBusyId(booking.id);
    try {
      await apiClient<{ id: string; deleted: boolean }>(`/bookings/${booking.id}`, { method: "DELETE" });
      toast.success(`${booking.id.slice(0, 8)} deleted`);
      setConfirm(null);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, "The booking could not be deleted"));
    } finally {
      setBusyId(null);
    }
  };

  const submitCancel = async (values: CancelValues) => {
    if (!cancelTarget) return;
    const booking = cancelTarget;
    const previous = statusOf(booking);
    setStatusOverrides((current) => ({ ...current, [booking.id]: "CANCELLED" }));
    setBusyId(booking.id);
    try {
      await apiClient<Booking>(`/bookings/${booking.id}/cancel`, {
        method: "PATCH",
        body: { reason: values.reason },
      });
      toast.success(`${booking.id.slice(0, 8)} cancelled — ${values.reason}`);
      setCancelTarget(null);
      cancelForm.reset();
      router.refresh();
    } catch (error) {
      setStatusOverrides((current) => ({ ...current, [booking.id]: previous }));
      toast.error(errorMessage(error, "The booking could not be cancelled"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          paramKey="status"
          label="Booking status"
          allLabel="All statuses"
          options={STATUSES.map((status) => ({ value: status, label: BOOKING_STATUS_META[status].label }))}
        />
        <SortSelect
          label="Sort bookings"
          options={[
            { value: "createdAt:desc", label: "Newest first" },
            { value: "createdAt:asc", label: "Oldest first" },
            { value: "startDate:asc", label: "Start date (soonest)" },
            { value: "startDate:desc", label: "Start date (latest)" },
            { value: "endDate:asc", label: "End date (soonest)" },
            { value: "totalAmount:desc", label: "Highest amount" },
            { value: "totalAmount:asc", label: "Lowest amount" },
          ]}
        />
      </div>

      <ActiveFilterChips ignore={["page", "pageSize", "sortBy", "sortOrder"]} />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Room / property</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const status = statusOf(booking);
              const paymentStatus: PaymentStatus | null = booking.payment?.status ?? null;
              const nights = nightsBetween(booking.startDate, booking.endDate ?? booking.startDate);
              const active = busyId === booking.id;

              return (
                <TableRow key={booking.id} data-pending={active || undefined}>
                  <TableCell>
                    <p className="font-mono text-xs font-medium" title={booking.id}>
                      {booking.id.slice(0, 8)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">created {formatDate(booking.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="truncate font-mono text-[11px]" title={booking.roomId}>
                      room {booking.roomId.slice(0, 8)}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground" title={booking.propertyId}>
                      prop {booking.propertyId.slice(0, 8)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="truncate font-mono text-[11px]" title={booking.tenantId}>
                      {booking.tenantId.slice(0, 8)}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDate(booking.startDate)}
                    <span className="text-muted-foreground"> → </span>
                    {booking.endDate ? formatDate(booking.endDate) : <span className="text-muted-foreground">open</span>}
                    <p className="text-[11px] text-muted-foreground">{nights} night{nights === 1 ? "" : "s"}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <p className="font-medium tabular-nums">{formatCurrency(booking.totalAmount, booking.currency)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      fee {formatCurrency(booking.platformFee, booking.currency)}
                    </p>
                  </TableCell>
                  <TableCell>
                    {active ? <Badge variant="info">Saving…</Badge> : <BookingStatusBadge status={status} />}
                  </TableCell>
                  <TableCell>
                    {paymentStatus ? (
                      <PaymentStatusBadge status={paymentStatus} />
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for booking ${booking.id.slice(0, 8)}`}
                          disabled={active}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Booking {booking.id.slice(0, 8)}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={status === "APPROVED"}
                          onSelect={() => setConfirm({ kind: "approve", booking })}
                        >
                          <Check />
                          Approve — admin override
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={status === "REJECTED"}
                          onSelect={() => setConfirm({ kind: "reject", booking })}
                        >
                          <Ban />
                          Reject — admin override
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={status === "CANCELLED" || status === "REJECTED"}
                          onSelect={() => {
                            cancelForm.reset();
                            setCancelTarget(booking);
                          }}
                        >
                          <TriangleAlert />
                          Cancel with reason
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          disabled={status === "APPROVED"}
                          title={
                            status === "APPROVED"
                              ? "The API refuses to delete an approved booking — cancel it first"
                              : undefined
                          }
                          onSelect={() => setConfirm({ kind: "delete", booking })}
                        >
                          <Trash2 />
                          Delete booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={cancelTarget !== null} onOpenChange={(open) => (open ? undefined : setCancelTarget(null))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel booking {cancelTarget?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              Cancelling releases the room and refunds a settled payment. The reason is stored on the audit trail.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={cancelForm.handleSubmit((values) => void submitCancel(values))}>
            <Field
              label="Reason"
              htmlFor="admin-booking-cancel-reason"
              error={cancelForm.formState.errors.reason?.message}
              required
            >
              <Textarea
                id="admin-booking-cancel-reason"
                rows={3}
                placeholder="Duplicate request, tenant withdrew, policy violation…"
                aria-invalid={Boolean(cancelForm.formState.errors.reason)}
                {...cancelForm.register("reason")}
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCancelTarget(null)}>
                Keep booking
              </Button>
              <Button type="submit" variant="destructive" loading={cancelForm.formState.isSubmitting}>
                Cancel booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => (open ? undefined : setConfirm(null))}
        title={
          confirm?.kind === "approve"
            ? "Approve this booking?"
            : confirm?.kind === "reject"
              ? "Reject this booking?"
              : "Delete this booking?"
        }
        description={
          confirm
            ? confirm.kind === "approve"
              ? `Admin override: ${confirm.booking.id.slice(0, 8)} is approved as if the owner decided. The room becomes occupied and the payment moves to processing.`
              : confirm.kind === "reject"
                ? `Admin override: ${confirm.booking.id.slice(0, 8)} is rejected. The room returns to available.`
                : `Deleting ${confirm.booking.id.slice(0, 8)} removes the record permanently. Approved bookings cannot be deleted — cancel them first.`
            : undefined
        }
        confirmLabel={
          confirm?.kind === "approve" ? "Approve booking" : confirm?.kind === "reject" ? "Reject booking" : "Delete booking"
        }
        destructive={confirm?.kind !== "approve"}
        loading={busyId !== null}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "approve") approve(confirm.booking);
          else if (confirm.kind === "reject") reject(confirm.booking);
          else void remove();
        }}
      />
    </div>
  );
}