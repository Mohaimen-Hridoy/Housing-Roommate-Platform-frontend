import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { apiDataSafe } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session";
import type { Message } from "@/lib/types/api";

import { MarkMessagesRead } from "@/components/dashboard/tenant/mark-messages-read";
import {
  MessageThread,
  ReplyForm,
  counterpartyLabel,
} from "@/components/dashboard/tenant/message-thread";

export const metadata: Metadata = {
  title: "Conversation",
  description: "Message thread with another participant.",
  robots: { index: false, follow: false },
};

export default async function TenantMessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionUser();

  if (!session) return notFound();

  if (session.id === id) {
    return (
      <EmptyState
        title="That is your own account"
        description="Pick a conversation from your inbox to read the thread with the other participant."
        action={{ label: "Back to messages", href: "/dashboard/messages" }}
      />
    );
  }

  const conversation = await apiDataSafe<Message[]>(`/messages/conversation/${id}`);
  const messages = (conversation.data ?? []).filter(
    (message) =>
      (message.senderId === session.id && message.recipientId === id) ||
      (message.senderId === id && message.recipientId === session.id),
  );

  const unreadIncoming = messages
    .filter((message) => message.senderId !== session.id && message.readAt === null)
    .map((message) => message.id);

  const propertyId = messages.find((message) => message.propertyId !== null)?.propertyId ?? null;

  return (
    <>
      <Link
        href="/dashboard/messages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to messages
      </Link>

      <PageHeader
        eyebrow="Conversation"
        title={counterpartyLabel(id)}
        description={`${messages.length} message${messages.length === 1 ? "" : "s"} with participant ${id}.`}
      />

      <MarkMessagesRead ids={unreadIncoming} />

      {conversation.error ? (
        <ErrorState title="This conversation could not be loaded" message={conversation.error} />
      ) : messages.length === 0 ? (
        <EmptyState
          title="No messages in this conversation"
          description="Nothing has been exchanged with this participant yet. Send the first message below."
        />
      ) : (
        <MessageThread messages={messages} counterpartyId={id} sessionId={session.id} />
      )}

      <ReplyForm counterpartyId={id} sessionId={session.id} propertyId={propertyId} />
    </>
  );
}