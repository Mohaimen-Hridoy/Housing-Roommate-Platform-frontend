"use client";

import { Inbox, Send } from "lucide-react";

import { useQueryParam, useUrlState } from "@/components/common/url-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FOLDERS = [
  { value: "inbox", label: "Inbox", icon: Inbox },
  { value: "sent", label: "Sent", icon: Send },
] as const;

/** Inbox / sent switcher — the active folder lives in the query string. */
export function MessageFolderTabs() {
  const folder = useQueryParam("folder", "inbox");
  const { setParams, isPending } = useUrlState();
  const active = folder === "sent" ? "sent" : "inbox";

  return (
    <Tabs value={active} onValueChange={(next) => setParams({ folder: next })} data-pending={isPending || undefined}>
      <TabsList>
        {FOLDERS.map((entry) => {
          const Icon = entry.icon;
          return (
            <TabsTrigger key={entry.value} value={entry.value}>
              <Icon className="size-4" aria-hidden="true" />
              {entry.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}