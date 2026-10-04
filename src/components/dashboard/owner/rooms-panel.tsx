"use client";

import { DoorOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { RoomStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoomFormDialog } from "@/components/dashboard/owner/room-form-dialog";
import { useOwnerMutation } from "@/components/dashboard/owner/use-owner-mutation";
import { ROOM_STATUS_META } from "@/lib/constants";
import { formatArea, formatCurrency } from "@/lib/format";
import type { Room, RoomStatus } from "@/lib/types/api";

const ROOM_STATUSES: RoomStatus[] = ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"];

interface RoomsPanelProps {
  propertyId: string;
  rooms: Room[];
  onRoomsChange: (rooms: Room[]) => void;
}

/** Room inventory for one property: status control, edit, delete and create. */
export function RoomsPanel({ propertyId, rooms, onRoomsChange }: RoomsPanelProps) {
  const { pendingKey, run } = useOwnerMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);

  const changeStatus = async (room: Room, next: RoomStatus) => {
    const previous = rooms;
    onRoomsChange(rooms.map((entry) => (entry.id === room.id ? { ...entry, status: next } : entry)));
    const updated = await run<Room>(`status-${room.id}`, `/rooms/${room.id}/status`, {
      method: "PATCH",
      body: { status: next },
      successMessage: `${room.title} is now ${ROOM_STATUS_META[next].label.toLowerCase()}.`,
    });
    if (!updated) onRoomsChange(previous);
  };

  const remove = async () => {
    if (!deleting) return;
    const result = await run(`delete-${deleting.id}`, `/rooms/${deleting.id}`, {
      method: "DELETE",
      successMessage: `${deleting.title} was deleted.`,
    });
    if (result) {
      onRoomsChange(rooms.filter((entry) => entry.id !== deleting.id));
      setDeleting(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rooms.length} room{rooms.length === 1 ? "" : "s"} · changes are saved immediately
        </p>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus />
          Add room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms in this listing"
          description="Tenants book rooms, not properties. Add your first room with a rent, then publish the listing."
          action={{ label: "Add the first room", onClick: openCreate }}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead className="hidden md:table-cell">Beds / baths</TableHead>
                <TableHead className="hidden lg:table-cell">Area</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <p className="font-medium">{room.title}</p>
                    {room.facing ? (
                      <p className="text-xs text-muted-foreground">
                        {room.facing.charAt(0) + room.facing.slice(1).toLowerCase()} facing
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <RoomStatusBadge status={room.status} />
                      <Select
                        value={room.status}
                        onValueChange={(next) => void changeStatus(room, next as RoomStatus)}
                        disabled={pendingKey === `status-${room.id}`}
                      >
                        <SelectTrigger
                          className="h-8 w-[9.5rem] text-xs"
                          aria-label={`Change status for ${room.title}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROOM_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {ROOM_STATUS_META[status].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(room.rent, room.currency)}
                    <span className="block text-xs font-normal text-muted-foreground">/ month</span>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {room.bedrooms ?? "—"} / {room.bathrooms ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatArea(room.area)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(room)}>
                        <Pencil />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(room)}
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RoomFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        propertyId={propertyId}
        room={editing}
        onSaved={(saved) => {
          const exists = rooms.some((entry) => entry.id === saved.id);
          onRoomsChange(exists ? rooms.map((entry) => (entry.id === saved.id ? saved : entry)) : [...rooms, saved]);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={deleting ? `Delete “${deleting.title}”?` : "Delete room"}
        description="The room is soft-deleted and can no longer be booked. Existing bookings are not affected."
        confirmLabel="Delete room"
        destructive
        loading={pendingKey !== null && deleting !== null && pendingKey === `delete-${deleting.id}`}
        onConfirm={remove}
      />

      <Card className="border-dashed bg-muted/20 shadow-none">
        <CardContent className="space-y-1 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">How room status behaves</p>
          <p>
            A tenant request flips a room to <strong>Reserved</strong>. Approving the booking makes it{" "}
            <strong>Occupied</strong>; rejecting or cancelling returns it to <strong>Available</strong>. Use{" "}
            <strong>Maintenance</strong> to take a room off the market without touching bookings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}