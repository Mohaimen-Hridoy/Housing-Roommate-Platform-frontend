"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { apiClient, errorMessage, type ClientRequestOptions } from "@/lib/api/client";

interface RunOptions extends ClientRequestOptions {
  /** Human message shown in the success toast. */
  successMessage: string;
}

/**
 * Small mutation helper for the owner area: every call goes through the
 * authenticated `apiClient`, always reports success/failure through Sonner and
 * refreshes the server-rendered route when the backend accepted the change.
 */
export function useOwnerMutation() {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const run = useCallback(
    async <TData,>(key: string, path: string, options: RunOptions): Promise<TData | null> => {
      const { successMessage, ...request } = options;
      setPendingKey(key);
      try {
        const result = await apiClient<TData>(path, request);
        toast.success(successMessage);
        router.refresh();
        return result.data;
      } catch (error) {
        toast.error(errorMessage(error));
        return null;
      } finally {
        setPendingKey(null);
      }
    },
    [router],
  );

  return { pendingKey, run };
}