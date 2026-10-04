"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { apiClient, errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import type { Message } from "@/lib/types/api";

const schema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write a reply before sending")
    .max(2000, "Keep the reply under 2000 characters"),
});

type Values = z.infer<typeof schema>;

/** Short, honest identifier for a counterparty the API does not embed. */
export function counterpartyLabel(counterpartyId: string): string {
  return `Conversation ${counterpartyId.slice(0, 8)}`;
}

export function MessageThread({
  messages,
  counterpartyId,
  sessionId,
}: {
  messages: Message[];
  counterpartyId: string;
  sessionId: string;
}) {
  const ordered = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{counterpartyLabel(counterpartyId)}</CardTitle>
        <CardDescription>
          {ordered.length} message{ordered.length === 1 ? "" : "s"} · counterparty id{" "}
          <code className="font-mono text-xs">{counterpartyId}</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {ordered.map((message) => {
            const mine = message.senderId === sessionId;
            return (
              <li key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] space-y-1 rounded-2xl px-4 py-3 text-sm sm:max-w-[70%]",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-secondary text-secondary-foreground",
                  )}
                >
                  {message.subject?.trim() && !mine ? (
                    <p className="text-xs font-semibold opacity-80">{message.subject}</p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <div
                    className={cn(
                      "flex items-center gap-2 pt-0.5 text-[11px]",
                      mine ? "text-primary-foreground/75" : "text-muted-foreground",
                    )}
                  >
                    <span>{formatDateTime(message.createdAt)}</span>
                    {!mine && message.readAt === null ? (
                      <Badge variant="accent" className="text-[10px]">
                        Unread
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/** Reply box for an existing conversation. */
export function ReplyForm({
  counterpartyId,
  sessionId,
  propertyId,
}: {
  counterpartyId: string;
  sessionId: string;
  propertyId?: string | null;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Values, unknown, Values>({
    resolver: zodResolver(schema) as Resolver<Values, unknown>,
    mode: "onChange",
    defaultValues: { body: "" },
  });

  const body = watch("body");

  const onSubmit = async (values: Values) => {
    setSending(true);
    try {
      await apiClient<Message>("/messages", {
        method: "POST",
        body: {
          recipientId: counterpartyId,
          body: values.body,
          ...(propertyId ? { propertyId } : {}),
        },
      });
      toast.success("Reply sent");
      reset({ body: "" });
      router.refresh();
    } catch (error) {
      toast.error("Could not send your reply", { description: errorMessage(error) });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reply</CardTitle>
        <CardDescription>Sending to {counterpartyLabel(counterpartyId)}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Your reply" htmlFor="reply-body" required error={errors.body?.message}>
            <Textarea
              id="reply-body"
              rows={4}
              placeholder="Type your reply…"
              aria-invalid={Boolean(errors.body)}
              {...register("body")}
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit" loading={sending} disabled={body.trim().length === 0}>
              <Send />
              Send reply
            </Button>
            <p className="text-xs text-muted-foreground">
              Signed in as {sessionId.slice(0, 8)}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}