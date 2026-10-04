"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { RatingInput } from "@/components/common/rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient, errorMessage } from "@/lib/api/client";
import type { Review, ReviewSubject } from "@/lib/types/api";

const schema = z.object({
  subject: z.enum(["ROOM", "PROPERTY"], { required_error: "Choose what you are reviewing" }),
  rating: z.number({ invalid_type_error: "Pick a rating" }).int().min(1, "Pick a rating").max(5),
  comment: z.string().trim().max(1000, "Keep the comment under 1000 characters"),
});

type Values = z.infer<typeof schema>;

export interface ReviewTarget {
  subject: ReviewSubject;
  reviewableId: string;
  label: string;
}

/**
 * Review form for an approved stay. Only targets the tenant has not already
 * reviewed are offered — the API allows one review per
 * (booking, subject, reviewableId, author).
 */
export function ReviewForm({ bookingId, targets }: { bookingId: string; targets: ReviewTarget[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const firstTarget = targets[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Values, unknown, Values>({
    resolver: zodResolver(schema) as Resolver<Values, unknown>,
    mode: "onChange",
    defaultValues: {
      subject: firstTarget?.subject ?? "ROOM",
      rating: 0,
      comment: "",
    },
  });

  const subject = watch("subject");
  const rating = watch("rating");

  if (targets.length === 0) return null;

  const onSubmit = async (values: Values) => {
    const target = targets.find((entry) => entry.subject === values.subject) ?? firstTarget;
    setSubmitting(true);
    try {
      await apiClient<Review>("/reviews", {
        method: "POST",
        body: {
          subject: target.subject,
          reviewableId: target.reviewableId,
          bookingId,
          rating: values.rating,
          comment: values.comment || undefined,
        },
      });
      toast.success("Review published", { description: `Thanks for rating ${target.label}.` });
      reset({ subject: target.subject, rating: 0, comment: "" });
      router.refresh();
    } catch (error) {
      toast.error("Could not publish your review", { description: errorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="size-4" aria-hidden="true" />
          Rate this stay
        </CardTitle>
        <CardDescription>
          Reviews unlock once the owner approves the booking. One review per subject.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Field label="Reviewing" htmlFor="review-subject" error={errors.subject?.message}>
            <Select
              value={subject}
              onValueChange={(next) => setValue("subject", next as ReviewSubject, { shouldValidate: true })}
            >
              <SelectTrigger id="review-subject" aria-invalid={Boolean(errors.subject)}>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {targets.map((target) => (
                  <SelectItem key={target.subject} value={target.subject}>
                    {target.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Rating" htmlFor="review-rating" required error={errors.rating?.message}>
            <div id="review-rating">
              <RatingInput
                value={rating}
                onChange={(next) => setValue("rating", next, { shouldValidate: true, shouldDirty: true })}
                error={errors.rating?.message}
              />
            </div>
          </Field>

          <Field
            label="Comment"
            htmlFor="review-comment"
            hint="Optional"
            error={errors.comment?.message}
          >
            <Textarea
              id="review-comment"
              rows={4}
              placeholder="What was the room like? How was communication with the owner?"
              aria-invalid={Boolean(errors.comment)}
              {...register("comment")}
            />
          </Field>

          <Button type="submit" loading={submitting}>
            Publish review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}