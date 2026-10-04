"use client";

import { Archive, Building2, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PropertyStatusBadge } from "@/components/common/status-badge";
import { ActiveFilterChips, FilterSelect, SearchInput, SortSelect } from "@/components/common/url-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient, errorMessage } from "@/lib/api/client";
import { PROPERTY_STATUS_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { pluralize } from "@/lib/utils";
import type { PropertyListItem, PropertyStatus } from "@/lib/types/api";

const STATUSES: PropertyStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

interface PropertiesViewProps {
  properties: PropertyListItem[];
}

export function PropertiesView({ properties }: PropertiesViewProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PropertyListItem | null>(null);

  const setStatus = async (property: PropertyListItem, status: PropertyStatus) => {
    setBusyId(property.id);
    try {
      await apiClient<PropertyListItem>(`/properties/${property.id}`, { method: "PATCH", body: { status } });
      toast.success(`${property.title} is now ${PROPERTY_STATUS_META[status].label.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, `The listing could not be marked ${status.toLowerCase()}`));
    } finally {
      setBusyId(null);
    }
  };

  const removeProperty = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await apiClient<{ id: string; deleted: boolean }>(`/properties/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`${deleteTarget.title} deleted`);
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, "The listing could not be deleted"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          paramKey="status"
          label="Listing status"
          allLabel="All statuses"
          options={STATUSES.map((status) => ({ value: status, label: PROPERTY_STATUS_META[status].label }))}
        />
        <SearchInput paramKey="search" placeholder="Search title or description" label="Search listings" className="w-full sm:w-64" />
        <SearchInput paramKey="city" placeholder="City" label="Filter by city" className="w-full sm:w-44" />
        <SearchInput paramKey="ownerId" placeholder="Owner id" label="Filter by owner id" className="w-full sm:w-48" />
        <SortSelect
          label="Sort listings"
          options={[
            { value: "createdAt:desc", label: "Newest first" },
            { value: "createdAt:asc", label: "Oldest first" },
            { value: "title:asc", label: "Title A–Z" },
            { value: "title:desc", label: "Title Z–A" },
            { value: "publishedAt:desc", label: "Recently published" },
            { value: "city:asc", label: "City A–Z" },
          ]}
        />
      </div>

      <ActiveFilterChips
        ignore={["page", "pageSize", "sortBy", "sortOrder"]}
        labels={{ search: "search", ownerId: "owner" }}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="max-w-[22rem]">
                  <p className="truncate font-medium">{property.title}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground" title={property.id}>
                    {property.id}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {property.city}
                  {property.state ? `, ${property.state}` : ""}
                </TableCell>
                <TableCell>
                  <p className="truncate font-mono text-[11px] text-muted-foreground" title={property.ownerId}>
                    {property.ownerId}
                  </p>
                </TableCell>
                <TableCell>
                  <PropertyStatusBadge status={property.status} />
                </TableCell>
                <TableCell>
                  {property.amenities.length === 0 ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : (
                    <Badge variant="secondary" title={property.amenities.map((amenity) => amenity.name).join(", ")}>
                      {pluralize(property.amenities.length, "amenity", "amenities")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(property.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${property.title}`}
                        disabled={busyId === property.id}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{property.title}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={property.status === "PUBLISHED"}
                        onSelect={() => void setStatus(property, "PUBLISHED")}
                      >
                        <Send />
                        Publish
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={property.status === "DRAFT"}
                        onSelect={() => void setStatus(property, "DRAFT")}
                      >
                        <Building2 />
                        Move to draft
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={property.status === "ARCHIVED"}
                        onSelect={() => void setStatus(property, "ARCHIVED")}
                      >
                        <Archive />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onSelect={() => setDeleteTarget(property)}>
                        <Trash2 />
                        Delete listing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => (open ? undefined : setDeleteTarget(null))}
        title="Delete this listing?"
        description={
          deleteTarget
            ? `${deleteTarget.title} and its rooms are removed from the platform. This cannot be undone from the console.`
            : undefined
        }
        confirmLabel="Delete listing"
        destructive
        loading={busyId !== null}
        onConfirm={removeProperty}
      />
    </div>
  );
}