"use client";

import { Archive, Eye, EyeOff, Settings2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useOwnerMutation } from "@/components/dashboard/owner/use-owner-mutation";
import type { PropertyStatus } from "@/lib/types/api";

interface ListingActionsProps {
  id: string;
  title: string;
  status: PropertyStatus;
}

const NEXT_STATUS: Record<PropertyStatus, { status: PropertyStatus; label: string; icon: typeof Eye }> = {
  DRAFT: { status: "PUBLISHED", label: "Publish", icon: Eye },
  PUBLISHED: { status: "DRAFT", label: "Unpublish", icon: EyeOff },
  ARCHIVED: { status: "PUBLISHED", label: "Republish", icon: Eye },
};

/** Publish / unpublish plus a guarded soft delete for a single listing. */
export function ListingActions({ id, title, status }: ListingActionsProps) {
  const { pendingKey, run } = useOwnerMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const target = NEXT_STATUS[status];
  const TargetIcon = target.icon;

  const changeStatus = () =>
    void run(id, `/properties/${id}`, {
      method: "PATCH",
      body: { status: target.status },
      successMessage:
        target.status === "PUBLISHED" ? `${title} is now published.` : `${title} moved back to draft.`,
    });

  const remove = async () => {
    const result = await run(id, `/properties/${id}`, {
      method: "DELETE",
      successMessage: `${title} was deleted.`,
    });
    if (result) setConfirmOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/owner/listings/${id}`}>
          <Settings2 />
          Manage
        </Link>
      </Button>

      <Button
        type="button"
        variant={target.status === "PUBLISHED" ? "success" : "outline"}
        size="sm"
        loading={pendingKey === id}
        onClick={changeStatus}
      >
        <TargetIcon />
        {target.label}
      </Button>

      {status === "ARCHIVED" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          loading={pendingKey === id}
          onClick={() =>
            void run(id, `/properties/${id}`, {
              method: "PATCH",
              body: { status: "DRAFT" as PropertyStatus },
              successMessage: `${title} was restored as a draft.`,
            })
          }
        >
          <Archive />
          Restore
        </Button>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 />
        Delete
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete “${title}”?`}
        description="The listing is soft-deleted and disappears from public search. Its rooms stay in the database but can no longer be booked."
        confirmLabel="Delete listing"
        destructive
        loading={pendingKey === id}
        onConfirm={remove}
      />
    </div>
  );
}