"use client";

import { MailOpen, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient, errorMessage } from "@/lib/api/client";
import { formatDateTime, formatRelative, truncate } from "@/lib/format";
import type { Message } from "@/lib/types/api";

export type MessageFolder = "inbox" | "sent";

type PendingAction = { kind: "delete" | "read"; id: string } | null;

function counterpartyOf(message: Message, folder: MessageFolder, sessionId: string): string {
  const raw = folder === "sent" ? message.recipientId : message.senderId;
  return raw === sessionId ? message.recipientId : raw;
}

/**
 * Inbox / sent message list. Read state and deletion are applied optimistically
 * and rolled back if the API rejects the change.
 */
export function MessageList({
  initialMessages,
  folder,
  sessionId,
}: {
  initialMessages: Message[];
  folder: MessageFolder;
  sessionId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState<PendingAction>(null);
  const [busy, setBusy] = useState(false);

  const markRead = async (message: Message) => {
    setPending({ kind: "read", id: message.id });
    setMessages((current) =>
      current.map((entry) => (entry.id === message.id ? { ...entry, readAt: new Date().toISOString() } : entry)),
    );
    try {
      await apiClient(`/messages/${message.id}/read`, { method: "PATCH", body: {} });
      toast.success("Marked as read");
      setPending(null);
    } catch (error) {
      setMessages((current) => current.map((entry) => (entry.id === message.id ? message : entry)));
      toast.error("Could not mark the message as read", { description: errorMessage(error) });
    }
  };

  const remove = async (message: Message) => {
    setBusy(true);
    setMessages((current) => current.filter((entry) => entry.id !== message.id));
    try {
      const result = await apiClient(`/messages/${message.id}`, { method: "DELETE" });
      toast.success(result.message || "Message deleted");
      setPending(null);
    } catch (error) {
      setMessages((current) =>
        current.some((entry) => entry.id === message.id) ? current : [message, ...current],
      );
      toast.error("Could not delete the message", { description: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const pendingMessage = pending ? messages.find((entry) => entry.id === pending.id) ?? null : null;

  return (
    <>
      {messages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={folder === "sent" ? "You have not sent anything yet" : "Your inbox is empty"}
          description={
            folder === "sent"
              ? "Messages you send to property owners or tenants appear here with their delivery state."
              : "Messages from property owners and tenants land here. Use Compose to start a conversation."
          }
          action={{ label: folder === "sent" ? "Switch to inbox" : "Browse properties", href: folder === "sent" ? "/dashboard/messages" : "/properties" }}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {messages.map((message) => {
                const counterpartyId = counterpartyOf(message, folder, sessionId);
                const unread = message.readAt === null && folder === "inbox";
                const working = pending?.id === message.id;

                return (
                  <li
                    key={message.id}
                    className={unread ? "bg-primary/[0.04]" : undefined}
                    data-pending={working || undefined}
                  >
                    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                      <Link
                        href={`/dashboard/messages/${counterpartyId}`}
                        className="min-w-0 flex-1 space-y-1"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {unread ? (
                            <Badge variant="accent" className="gap-1">
                              <MailOpen className="size-3" aria-hidden="true" />
                              Unread
                            </Badge>
                          ) : null}
                          <span className={unread ? "truncate font-semibold" : "truncate font-medium"}>
                            {message.subject?.trim() ? message.subject : "(no subject)"}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{message.body}</p>
                        <p className="text-xs text-muted-foreground">
                          Conversation {counterpartyId.slice(0, 8)} · {formatRelative(message.createdAt)}
                          {message.propertyId ? ` · property ${message.propertyId.slice(0, 8)}` : ""}
                        </p>
                      </Link>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden text-xs text-muted-foreground lg:inline">
                          {formatDateTime(message.createdAt)}
                        </span>
                        {unread ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => void markRead(message)}
                            loading={working && pending?.kind === "read"}
                          >
                            Mark read
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete message: ${truncate(message.body, 40)}`}
                          onClick={() => setPending({ kind: "delete", id: message.id })}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={pending?.kind === "delete"}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="Delete this message?"
        description="The message is removed from both sides of the conversation. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={() => {
          if (pendingMessage) return remove(pendingMessage);
        }}
      />
    </>
  );
}