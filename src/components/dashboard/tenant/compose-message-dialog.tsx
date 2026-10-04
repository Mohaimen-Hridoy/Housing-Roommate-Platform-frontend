"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { apiClient, errorMessage } from "@/lib/api/client";
import type { Message } from "@/lib/types/api";

/** Accepts both UUID and Mongo ObjectId shaped identifiers. */
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

const schema = z.object({
  recipientId: z
    .string()
    .trim()
    .min(1, "Recipient user id is required")
    .regex(ID_PATTERN, "Enter a valid user id (UUID or object id)"),
  propertyId: z
    .string()
    .trim()
    .refine((value) => value === "" || ID_PATTERN.test(value), "Enter a valid property id, or leave it empty")
    .optional(),
  subject: z.string().trim().max(120, "Subject must be 120 characters or fewer").optional(),
  body: z
    .string()
    .trim()
    .min(1, "Write a message before sending")
    .max(2000, "Keep the message under 2000 characters"),
});

type Values = z.infer<typeof schema>;

const EMPTY: Values = { recipientId: "", propertyId: "", subject: "", body: "" };

/** Compose dialog — the recipient id comes from the property owner or booking tenant. */
export function ComposeMessageDialog({
  defaultRecipientId = "",
  defaultPropertyId = "",
  triggerLabel = "Compose",
}: {
  defaultRecipientId?: string;
  defaultPropertyId?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, Values>({
    resolver: zodResolver(schema) as Resolver<Values, unknown>,
    mode: "onChange",
    defaultValues: { ...EMPTY, recipientId: defaultRecipientId, propertyId: defaultPropertyId },
  });

  const onSubmit = async (values: Values) => {
    try {
      await apiClient<Message>("/messages", {
        method: "POST",
        body: {
          recipientId: values.recipientId,
          body: values.body,
          ...(values.subject ? { subject: values.subject } : {}),
          ...(values.propertyId ? { propertyId: values.propertyId } : {}),
        },
      });
      toast.success("Message sent", { description: "The recipient will see it in their inbox." });
      reset(EMPTY);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Could not send the message", { description: errorMessage(error) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Pencil />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compose a message</DialogTitle>
          <DialogDescription>
            Use the user id of the property owner or of the tenant on a booking you take part in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Recipient user id" htmlFor="compose-recipient" required error={errors.recipientId?.message}>
            <Input
              id="compose-recipient"
              placeholder="e.g. 7f3c1d2a-…"
              aria-invalid={Boolean(errors.recipientId)}
              {...register("recipientId")}
            />
          </Field>

          <Field
            label="Property id"
            htmlFor="compose-property"
            hint="Optional"
            error={errors.propertyId?.message}
          >
            <Input
              id="compose-property"
              placeholder="Link the message to a property"
              aria-invalid={Boolean(errors.propertyId)}
              {...register("propertyId")}
            />
          </Field>

          <Field label="Subject" htmlFor="compose-subject" hint="Optional" error={errors.subject?.message}>
            <Input
              id="compose-subject"
              placeholder="Question about the room"
              aria-invalid={Boolean(errors.subject)}
              {...register("subject")}
            />
          </Field>

          <Field label="Message" htmlFor="compose-body" required error={errors.body?.message}>
            <Textarea
              id="compose-body"
              rows={5}
              placeholder="Write your message…"
              aria-invalid={Boolean(errors.body)}
              {...register("body")}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Send message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}