import type { Metadata } from "next";

import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { PageHeader } from "@/components/common/page-header";
import { ActiveFilterChips, FilterSelect } from "@/components/common/url-state";
import { apiListSafe } from "@/lib/api/server";
import { getSessionUser } from "@/lib/auth/session";
import type { Message } from "@/lib/types/api";

import { ComposeMessageDialog } from "@/components/dashboard/tenant/compose-message-dialog";
import { MessageFolderTabs } from "@/components/dashboard/tenant/message-folder-tabs";
import { MessageList, type MessageFolder } from "@/components/dashboard/tenant/message-list";

export const metadata: Metadata = {
  title: "Messages",
  description: "Conversations with property owners and tenants.",
  robots: { index: false, follow: false },
};

const READ_OPTIONS = [
  { value: "false", label: "Unread only" },
  { value: "true", label: "Read only" },
];

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TenantMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getSessionUser();

  const folder: MessageFolder = one(params.folder) === "sent" ? "sent" : "inbox";
  const read = one(params.read);
  const page = one(params.page);
  const pageSize = one(params.pageSize);

  const result = await apiListSafe<Message>("/messages", {
    query: { folder, read, page, pageSize },
  });

  return (
    <>
      <PageHeader
        eyebrow="Tenant dashboard"
        title="Messages"
        description="Conversations about rooms and bookings. The API does not expose other user profiles to tenants, so each thread is labelled by participant id."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Messages" }]}
        actions={<ComposeMessageDialog />}
      />

      <MessageFolderTabs />

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect paramKey="read" label="Read status" allLabel="All messages" options={READ_OPTIONS} />
      </div>

      <ActiveFilterChips labels={{ folder: "Folder", read: "Read" }} />

      {result.error ? (
        <ErrorState title="Messages could not be loaded" message={result.error} />
      ) : (
        <>
          <MessageList
            initialMessages={result.items}
            folder={folder}
            sessionId={session?.id ?? ""}
          />
          <Pagination meta={result.pagination} />
        </>
      )}
    </>
  );
}