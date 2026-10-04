"use client";

import { MessageSquareQuote, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { RatingStars } from "@/components/common/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient, errorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import type { Review, ReviewSubject } from "@/lib/types/api";

export interface TenantReviewRow {
  review: Review;
  /** Property title for PROPERTY reviews, room title for ROOM reviews. */
  targetLabel: string | null;
  targetHref: string | null;
}

/** Reviews the tenant authored, with an optimistic delete. */
export function ReviewList({ initialRows }: { initialRows: TenantReviewRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const remove = async (row: TenantReviewRow) => {
    setBusy(true);
    setRows((current) => current.filter((entry) => entry.review.id !== row.review.id));
    try {
      const result = await apiClient(`/reviews/${row.review.id}`, { method: "DELETE" });
      toast.success(result.message || "Review deleted");
      setConfirming(null);
    } catch (error) {
      setRows((current) =>
        current.some((entry) => entry.review.id === row.review.id) ? current : [row, ...current],
      );
      toast.error("Could not delete the review", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const pendingRow = rows.find((entry) => entry.review.id === confirming) ?? null;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title="You have not written any reviews yet"
        description="Once the owner approves one of your bookings you can rate the room and the property."
        action={{ label: "View my bookings", href: "/dashboard/bookings" }}
      />
    );
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <li key={row.review.id}>
            <Card className="flex h-full flex-col">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <RatingStars rating={row.review.rating} />
                    <p className="text-xs text-muted-foreground">{formatDate(row.review.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={row.review.subject === ("ROOM" satisfies ReviewSubject) ? "info" : "secondary"}>
                      {row.review.subject === "ROOM" ? "Room" : "Property"}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete my review"
                      onClick={() => setConfirming(row.review.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {row.review.comment?.trim()
                    ? row.review.comment
                    : "No comment was left with this rating."}
                </p>

                <p className="mt-auto pt-1 text-sm">
                  {row.targetHref ? (
                    <Link href={row.targetHref} className="font-medium hover:text-primary">
                      {row.targetLabel ?? "View listing"}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">
                      {row.targetLabel ?? `Reviewable ${row.review.reviewableId.slice(0, 8)}`}
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open) setConfirming(null);
        }}
        title="Delete this review?"
        description="Your rating and comment are removed from the listing. You can write a new review afterwards."
        confirmLabel="Delete review"
        destructive
        loading={busy}
        onConfirm={() => {
          if (pendingRow) return remove(pendingRow);
        }}
      />
    </>
  );
}