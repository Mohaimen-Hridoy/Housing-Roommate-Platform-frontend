"use client";

import { useRouter } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";

interface AdminErrorStateProps {
  message: string;
  title?: string;
  className?: string;
}

/**
 * `ErrorState` wired to a soft Server Component fetch failure: the data is
 * re-read from the API without a hard navigation, so the admin can retry after
 * the backend comes back.
 */
export function AdminErrorState({ message, title, className }: AdminErrorStateProps) {
  const router = useRouter();

  return (
    <ErrorState
      title={title}
      message={message}
      className={className}
      onRetry={() => {
        router.refresh();
      }}
    />
  );
}