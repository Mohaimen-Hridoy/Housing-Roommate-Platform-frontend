"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { apiClient, errorMessage } from "@/lib/api/client";

/**
 * Marks incoming messages read once the conversation is opened. Runs in an
 * effect (never during render) and is guarded so React strict mode cannot
 * fire the same PATCH twice.
 */
export function MarkMessagesRead({ ids }: { ids: string[] }) {
  const key = ids.join(",");
  const started = useRef(false);

  useEffect(() => {
    if (started.current || key === "") return;
    started.current = true;

    void (async () => {
      for (const id of key.split(",")) {
        try {
          await apiClient(`/messages/${id}/read`, { method: "PATCH", body: {} });
        } catch (error) {
          toast.error("Could not mark a message as read", { description: errorMessage(error) });
        }
      }
    })();
  }, [key]);

  return null;
}