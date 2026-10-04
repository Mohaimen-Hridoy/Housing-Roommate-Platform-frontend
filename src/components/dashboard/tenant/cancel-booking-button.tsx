"use client";

import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiClient, errorMessage } from "@/lib/api/client";

interface CancelBookingButtonProps {
  bookingId: string;
  /** Called before the request settles so a list can drop the row optimistically. */
  onCancelled?: () => void;
  /** Called when the API rejects the cancellation and the row must come back. */
  onRollback?: () => void;
  label?: string;
}

/**
 * Cancels a `PENDING`/`APPROVED` booking. The row is dropped from the list
 * before the request settles and restored when the API rejects the change.
 */
export function CancelBookingButton({
  bookingId,
  onCancelled,
  onRollback,
  label = "Cancel",
}: CancelBookingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    onCancelled?.();
    try {
      const result = await apiClient(`/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        body: { reason: "Cancelled by the tenant" },
      });
      toast.success(result.message || "Booking cancelled", {
        description: "The room was released and any settled payment was refunded.",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      onRollback?.();
      toast.error("Could not cancel this booking", { description: errorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <XCircle />
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel this booking?"
        description="The room is released back to the owner and a settled payment is refunded. This cannot be undone."
        confirmLabel="Cancel booking"
        destructive
        loading={pending}
        onConfirm={confirm}
      />
    </>
  );
}