import Link from "next/link";
import { Star } from "lucide-react";

import { apiListSafe } from "@/lib/api/server";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/common/rating";
import { EmptyState } from "@/components/common/empty-state";
import { formatDate } from "@/lib/format";
import { humanize } from "@/lib/utils";
import type { Review } from "@/lib/types/api";

interface SubjectReviewsProps {
  subject: "ROOM" | "PROPERTY";
  reviewableId: string;
  title: string;
  emptyHint?: string;
}

const SUBJECT_LABELS: Record<"ROOM" | "PROPERTY", string> = {
  ROOM: "room",
  PROPERTY: "property",
};

/** Real reviews for a room or property, read from the public reviews endpoint. */
export async function SubjectReviews({ subject, reviewableId, title, emptyHint }: SubjectReviewsProps) {
  const result = await apiListSafe<Review>("/reviews", {
    query: { subject, reviewableId, pageSize: 20, sortBy: "rating", sortOrder: "desc" },
  });

  const reviews = result.items;
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Reviews</h2>
            <p className="text-sm text-muted-foreground">
              {reviews.length > 0
                ? `${reviews.length} review${reviews.length === 1 ? "" : "s"} for this ${SUBJECT_LABELS[subject]}`
                : `No reviews yet for this ${SUBJECT_LABELS[subject]}`}
            </p>
          </div>
          {reviews.length > 0 ? <RatingStars rating={average} size="md" count={reviews.length} /> : null}
        </div>

        {result.error ? (
          <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
            Reviews could not be loaded: {result.error}
          </p>
        ) : null}

        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            compact
            title={`No reviews for this ${SUBJECT_LABELS[subject]} yet`}
            description={
              emptyHint ??
              `Only tenants and owners with an approved booking on ${title} can leave a review.`
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map((review) => (
              <li key={review.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rating} showValue={false} />
                    <span className="text-sm font-medium">
                      {review.author?.name ?? humanize(review.authorId)}
                    </span>
                  </div>
                  <time dateTime={review.createdAt} className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                {review.comment ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No written comment.</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="border-t border-border pt-4 text-xs text-muted-foreground">
          Reviews come from approved bookings only. Tenants can leave one from{" "}
          <Link href="/dashboard/reviews" className="underline underline-offset-4 hover:text-foreground">
            their dashboard
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
