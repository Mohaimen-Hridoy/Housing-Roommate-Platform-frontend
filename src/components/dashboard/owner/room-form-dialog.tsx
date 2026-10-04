"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldRow } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOwnerMutation } from "@/components/dashboard/owner/use-owner-mutation";
import { FACING_META, ROOM_STATUS_META } from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";
import { CURRENCIES, type Room, type RoomFacing, type RoomInput, type RoomStatus } from "@/lib/types/api";

const FACINGS: RoomFacing[] = ["NORTH", "SOUTH", "EAST", "WEST"];
const ROOM_STATUSES: RoomStatus[] = ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"];

function optionalNumber(message: string) {
  return z
    .string()
    .trim()
    .default("")
    .refine((value) => value === "" || Number.isFinite(Number(value)), { message });
}

const roomSchema = z.object({
  title: z.string().trim().min(2, "Room title must be at least 2 characters").max(200, "Title is too long"),
  description: z.string().trim().max(2000, "Keep the description under 2000 characters").default(""),
  area: optionalNumber("Area must be a number").refine((value) => value === "" || Number(value) > 0, {
    message: "Area must be greater than 0",
  }),
  rent: z
    .string()
    .trim()
    .min(1, "Rent is required")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, { message: "Rent must be a positive number" }),
  currency: z.enum(CURRENCIES),
  deposit: z
    .string()
    .trim()
    .default("")
    .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), {
      message: "Deposit cannot be negative",
    }),
  bedrooms: z
    .string()
    .trim()
    .default("")
    .refine((value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0), {
      message: "Bedrooms must be a whole number of 0 or more",
    }),
  bathrooms: z
    .string()
    .trim()
    .default("")
    .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), {
      message: "Bathrooms must be 0 or more",
    }),
  facing: z.union([z.literal(""), z.enum(["NORTH", "SOUTH", "EAST", "WEST"])]).default(""),
  availableFrom: z.string().default(""),
  status: z.enum(["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"]),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  /** `null` creates a new room; a room patches the existing one. */
  room: Room | null;
  onSaved: (room: Room) => void;
}

export function RoomFormDialog({ open, onOpenChange, propertyId, room, onSaved }: RoomFormDialogProps) {
  const { pendingKey, run } = useOwnerMutation();
  const isEditing = room !== null;

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      area: "",
      rent: "",
      currency: "usd",
      deposit: "",
      bedrooms: "",
      bathrooms: "",
      facing: "",
      availableFrom: "",
      status: "AVAILABLE",
    },
  });

  const values = form.watch();
  const errors = form.formState.errors;

  useEffect(() => {
    if (!open) return;
    form.reset(
      room
        ? {
            title: room.title,
            description: room.description ?? "",
            area: room.area === null ? "" : String(room.area),
            rent: String(room.rent),
            currency: (CURRENCIES.find((code) => code === room.currency.toLowerCase()) ?? "usd") as RoomFormValues["currency"],
            deposit: room.deposit === null ? "" : String(room.deposit),
            bedrooms: room.bedrooms === null ? "" : String(room.bedrooms),
            bathrooms: room.bathrooms === null ? "" : String(room.bathrooms),
            facing: room.facing ?? "",
            availableFrom: toDateInputValue(room.availableFrom),
            status: room.status,
          }
        : {
            title: "",
            description: "",
            area: "",
            rent: "",
            currency: "usd",
            deposit: "",
            bedrooms: "",
            bathrooms: "",
            facing: "",
            availableFrom: "",
            status: "AVAILABLE",
          },
    );
  }, [open, room, form]);

  const submit = form.handleSubmit(async (submitted) => {
    const payload: RoomInput = {
      title: submitted.title,
      description: submitted.description || undefined,
      area: submitted.area === "" ? undefined : Number(submitted.area),
      rent: Number(submitted.rent),
      currency: submitted.currency,
      deposit: submitted.deposit === "" ? undefined : Number(submitted.deposit),
      bedrooms: submitted.bedrooms === "" ? undefined : Number(submitted.bedrooms),
      bathrooms: submitted.bathrooms === "" ? undefined : Number(submitted.bathrooms),
      facing: submitted.facing || undefined,
      availableFrom:
        submitted.availableFrom === "" ? undefined : new Date(`${submitted.availableFrom}T00:00:00`).toISOString(),
      status: submitted.status,
    };

    const path = isEditing ? `/rooms/${room.id}` : `/properties/${propertyId}/rooms`;
    const saved = await run<Room>(isEditing ? `room-${room.id}` : "room-new", path, {
      method: isEditing ? "PATCH" : "POST",
      body: payload,
      successMessage: isEditing ? `${submitted.title} was updated.` : `${submitted.title} was added.`,
    });

    if (saved) {
      onSaved(saved);
      onOpenChange(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${room.title}` : "Add a room"}</DialogTitle>
          <DialogDescription>
            Rent is charged per month. Currency must be one of the supported codes and the status controls whether the
            room appears as bookable.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Room title" htmlFor="room-title" error={errors.title?.message} required>
            <Input id="room-title" placeholder="Room 2 — north facing" aria-invalid={Boolean(errors.title)} {...form.register("title")} />
          </Field>

          <Field label="Description" htmlFor="room-description" hint="Optional" error={errors.description?.message}>
            <Textarea id="room-description" placeholder="Furnished room with a shared balcony." aria-invalid={Boolean(errors.description)} {...form.register("description")} />
          </Field>

          <FieldRow>
            <Field label="Monthly rent" htmlFor="room-rent" error={errors.rent?.message} required>
              <Input id="room-rent" inputMode="decimal" placeholder="650" aria-invalid={Boolean(errors.rent)} {...form.register("rent")} />
            </Field>
            <Field label="Currency" htmlFor="room-currency" required>
              <Select value={values.currency} onValueChange={(next) => form.setValue("currency", next as RoomFormValues["currency"], { shouldValidate: true })}>
                <SelectTrigger id="room-currency" aria-label="Currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Deposit" htmlFor="room-deposit" hint="Optional" error={errors.deposit?.message}>
              <Input id="room-deposit" inputMode="decimal" placeholder="650" aria-invalid={Boolean(errors.deposit)} {...form.register("deposit")} />
            </Field>
            <Field label="Area (m²)" htmlFor="room-area" hint="Optional" error={errors.area?.message}>
              <Input id="room-area" inputMode="decimal" placeholder="18" aria-invalid={Boolean(errors.area)} {...form.register("area")} />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Bedrooms" htmlFor="room-bedrooms" hint="Optional" error={errors.bedrooms?.message}>
              <Input id="room-bedrooms" inputMode="numeric" placeholder="1" aria-invalid={Boolean(errors.bedrooms)} {...form.register("bedrooms")} />
            </Field>
            <Field label="Bathrooms" htmlFor="room-bathrooms" hint="Optional" error={errors.bathrooms?.message}>
              <Input id="room-bathrooms" inputMode="decimal" placeholder="1" aria-invalid={Boolean(errors.bathrooms)} {...form.register("bathrooms")} />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Facing" htmlFor="room-facing" hint="Optional">
              <Select
                value={values.facing === "" ? "NONE" : values.facing}
                onValueChange={(next) => form.setValue("facing", next === "NONE" ? "" : (next as RoomFacing), { shouldValidate: true })}
              >
                <SelectTrigger id="room-facing" aria-label="Facing">
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Not specified</SelectItem>
                  {FACINGS.map((facing) => (
                    <SelectItem key={facing} value={facing}>
                      {FACING_META[facing].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Available from" htmlFor="room-available-from" hint="Optional">
              <Input id="room-available-from" type="date" {...form.register("availableFrom")} />
            </Field>
          </FieldRow>

          <Field label="Status" htmlFor="room-status" required>
            <Select
              value={values.status}
              onValueChange={(next) => form.setValue("status", next as RoomStatus, { shouldValidate: true })}
            >
              <SelectTrigger id="room-status" aria-label="Room status">
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
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pendingKey !== null}>
              Cancel
            </Button>
            <Button type="submit" loading={pendingKey !== null}>
              {isEditing ? "Save changes" : "Add room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}