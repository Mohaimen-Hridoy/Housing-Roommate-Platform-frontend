"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Layers, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ActiveFilterChips, SearchInput, SortSelect, useQueryParam } from "@/components/common/url-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldRow } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientApiError, apiClient, errorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import type { Amenity } from "@/lib/types/api";

const amenitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "The name must be at least 2 characters")
    .max(60, "The name must be under 60 characters"),
  icon: z
    .string()
    .trim()
    .max(40, "The icon key must be under 40 characters")
    .optional()
    .or(z.literal("")),
});

type AmenityValues = z.infer<typeof amenitySchema>;

interface AmenitiesViewProps {
  amenities: Amenity[];
}

export function AmenitiesView({ amenities }: AmenitiesViewProps) {
  const router = useRouter();
  const search = useQueryParam("search");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Amenity | null>(null);

  const form = useForm<AmenityValues>({
    resolver: zodResolver(amenitySchema),
    defaultValues: { name: "", icon: "" },
  });

  /**
   * The backend caches amenity lists, so a plain refresh can still return the
   * pre-mutation payload. Re-read once more after a short delay.
   */
  const refreshAfterMutation = () => {
    router.refresh();
    window.setTimeout(() => router.refresh(), 700);
  };

  const submit = async (values: AmenityValues) => {
    const name = values.name.trim();
    const icon = values.icon?.trim();
    try {
      await apiClient<Amenity>("/amenities", { method: "POST", body: icon ? { name, icon } : { name } });
      toast.success(`Amenity “${name}” created`);
      form.reset({ name: "", icon: "" });
      refreshAfterMutation();
    } catch (error) {
      if (error instanceof ClientApiError && error.status === 409) {
        form.setError("name", { message: error.message });
        toast.error(error.message);
        return;
      }
      const message = errorMessage(error, "The amenity could not be created");
      form.setError("name", { message });
      toast.error(message);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await apiClient<{ id: string; deleted: boolean }>(`/amenities/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`Amenity “${deleteTarget.name}” deleted`);
      setDeleteTarget(null);
      refreshAfterMutation();
    } catch (error) {
      toast.error(errorMessage(error, "The amenity could not be deleted"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <strong className="text-foreground">Amenities are shared vocabulary.</strong> Every listing references these
          entries by id, so deleting one detaches it from all properties that use it. Names are unique — creating a
          duplicate returns a <em>409 conflict</em>.
        </p>
      </div>

      <form
        className="space-y-3 rounded-xl border border-border bg-card p-4"
        onSubmit={form.handleSubmit((values) => void submit(values))}
      >
        <p className="text-sm font-semibold">Add an amenity</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FieldRow className="flex-1">
            <Field
              label="Name"
              htmlFor="admin-amenity-name"
              error={form.formState.errors.name?.message}
              required
            >
              <Input
                id="admin-amenity-name"
                placeholder="Air conditioning"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
            </Field>
            <Field
              label="Icon"
              htmlFor="admin-amenity-icon"
              hint="Optional"
              error={form.formState.errors.icon?.message}
            >
              <Input
                id="admin-amenity-icon"
                placeholder="snowflake"
                aria-invalid={Boolean(form.formState.errors.icon)}
                {...form.register("icon")}
              />
            </Field>
          </FieldRow>
          <Button type="submit" loading={form.formState.isSubmitting} className="shrink-0">
            <PlusCircle />
            Add amenity
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput paramKey="search" placeholder="Search amenities" label="Search amenities" className="w-full sm:w-64" />
        <SortSelect
          label="Sort amenities"
          options={[
            { value: "name:asc", label: "Name A–Z" },
            { value: "name:desc", label: "Name Z–A" },
            { value: "createdAt:desc", label: "Newest first" },
            { value: "createdAt:asc", label: "Oldest first" },
          ]}
        />
      </div>

      <ActiveFilterChips ignore={["page", "pageSize", "sortBy", "sortOrder"]} />

      {amenities.length === 0 ? (
        <EmptyState
          compact
          icon={Layers}
          title="No amenities to show"
          description={
            search
              ? "No amenity matches this search yet — try a shorter term."
              : "Add the first amenity above — owners attach these entries to their listings."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amenity</TableHead>
                <TableHead>Icon key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amenities.map((amenity) => (
                <TableRow key={amenity.id} data-pending={busyId === amenity.id || undefined}>
                  <TableCell>
                    <p className="font-medium">{amenity.name}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground" title={amenity.id}>
                      {amenity.id}
                    </p>
                  </TableCell>
                  <TableCell>
                    {amenity.icon ? (
                      <Badge variant="outline" className="font-mono">
                        {amenity.icon}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {amenity.createdAt ? formatDate(amenity.createdAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${amenity.name}`}
                      disabled={busyId === amenity.id}
                      onClick={() => setDeleteTarget(amenity)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => (open ? undefined : setDeleteTarget(null))}
        title="Delete this amenity?"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be removed from every property that references it. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete amenity"
        destructive
        loading={busyId !== null}
        onConfirm={remove}
      />
    </div>
  );
}