"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Check, ChevronLeft, ChevronRight, MessageSquare, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { apiClient, errorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { RoomStatusBadge } from "@/components/common/status-badge";
import { formatCurrency, nightsBetween, toDateInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking, RoomSummary } from "@/lib/types/api";

const bookingSchema = z
  .object({
    roomId: z.string().min(1, "Choose a room to continue"),
    startDate: z.string().min(1, "Pick a start date"),
    endDate: z.string().min(1, "Pick an end date"),
    message: z.string().max(1000, "Keep your message under 1000 characters").optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "The end date must be after the start date",
    path: ["endDate"],
  })
  .refine((data) => new Date(data.startDate) > new Date(Date.now() - 86_400_000), {
    message: "The start date must be in the future",
    path: ["startDate"],
  });

type BookingValues = z.infer<typeof bookingSchema>;

const STEPS = [
  { id: "room", label: "Room", icon: Check },
  { id: "dates", label: "Dates", icon: CalendarDays },
  { id: "review", label: "Review", icon: MessageSquare },
  { id: "done", label: "Done", icon: PartyPopper },
] as const;

interface BookingWizardProps {
  rooms: RoomSummary[];
  /** Present when the visitor already has a booking on this property. */
  isAuthenticated: boolean;
  isTenant: boolean;
  propertyId: string;
  initialRoomId?: string;
}

export function BookingWizard({
  rooms,
  isAuthenticated,
  isTenant,
  propertyId,
  initialRoomId,
}: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultRoomId = useMemo(() => {
    if (initialRoomId && rooms.some((r) => r.id === initialRoomId)) {
      return initialRoomId;
    }
    return rooms.length === 1 ? rooms[0].id : "";
  }, [initialRoomId, rooms]);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    mode: "onBlur",
    defaultValues: {
      roomId: defaultRoomId,
      startDate: "",
      endDate: "",
      message: "",
    },
  });

  const values = form.watch();
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === values.roomId) ?? null,
    [rooms, values.roomId],
  );

  const nights = useMemo(() => {
    if (!values.startDate || !values.endDate || !selectedRoom) return 0;
    return nightsBetween(values.startDate, values.endDate);
  }, [selectedRoom, values.endDate, values.startDate]);

  const total = selectedRoom ? selectedRoom.rent * nights : 0;
  const platformFeeNote = "A platform handling fee is added by the server when the booking is created.";

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Want to book this room?</h2>
          <p className="text-sm text-muted-foreground">
            Sign in as a tenant to send a booking request. You can also explore the demo accounts first.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={`/login?next=/properties/${propertyId}`}>Sign in to book</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create a tenant account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isTenant) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Booking is for tenants</h2>
          <p className="text-sm text-muted-foreground">
            You are signed in with a role that manages listings rather than renting. Switch to a tenant
            account to send a booking request for this property.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Sign in with a tenant account</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (created) {
    return (
      <Card className="border-success/40 bg-success/5">
        <CardContent className="space-y-4 p-6">
          <span className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Request sent to the owner</h2>
            <p className="text-sm text-muted-foreground">
              Booking <span className="font-mono text-xs">{created.id}</span> is now{" "}
              <span className="font-medium text-foreground">pending</span>. The room is reserved while the
              owner reviews it — once approved you can pay through Stripe.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={`/dashboard/bookings/${created.id}`}>Track this booking</Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => router.refresh()}>
              Keep browsing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-2 p-6">
          <h2 className="text-lg font-semibold">No rooms available right now</h2>
          <p className="text-sm text-muted-foreground">
            Every room in this property is reserved, occupied or under maintenance. Save the property and
            check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(data: BookingValues) {
    setSubmitting(true);
    try {
      const result = await apiClient<Booking>("/bookings", {
        method: "POST",
        body: {
          roomId: data.roomId,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          message: data.message?.trim() ? data.message.trim() : undefined,
        },
      });
      setCreated(result.data);
      toast.success("Booking request created", {
        description: "The owner has been notified and the room is reserved.",
      });
      router.refresh();
    } catch (error) {
      toast.error("Could not create the booking", { description: errorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold">Request this room</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Three quick steps. Nothing is charged until the owner approves your request.
        </p>

        <ol className="mt-5 flex items-center gap-2" aria-label="Booking steps">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const state = index < step ? "done" : index === step ? "current" : "todo";
            return (
              <li key={item.id} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    state === "done" && "border-success bg-success text-success-foreground",
                    state === "current" && "border-primary bg-primary text-primary-foreground",
                    state === "todo" && "border-border text-muted-foreground",
                  )}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">
                    Step {index + 1}: {item.label}
                  </span>
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    state === "current" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
                {index < STEPS.length - 1 ? (
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                ) : null}
              </li>
            );
          })}
        </ol>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="mt-6 space-y-6"
          key={step}
        >
          {step === 0 ? (
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Choose an available room</legend>
              {rooms.map((room) => (
                <label
                  key={room.id}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 transition-colors",
                    values.roomId === room.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      value={room.id}
                      className="mt-1 size-4 accent-[hsl(var(--primary))]"
                      {...form.register("roomId")}
                    />
                    <span className="space-y-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{room.title}</span>
                        <RoomStatusBadge status="AVAILABLE" />
                      </span>
                      <span className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {room.bedrooms !== null ? <span>{room.bedrooms} bedroom</span> : null}
                        {room.bathrooms !== null ? <span>{room.bathrooms} bathroom</span> : null}
                        {room.area !== null ? <span>{room.area} m²</span> : null}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatCurrency(room.rent, room.currency)}
                    <span className="text-xs font-normal text-muted-foreground">/night</span>
                  </span>
                </label>
              ))}
              {form.formState.errors.roomId ? (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {form.formState.errors.roomId.message}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Start date"
                htmlFor="startDate"
                required
                error={form.formState.errors.startDate?.message}
              >
                <Input
                  id="startDate"
                  type="date"
                  min={toDateInputValue(new Date())}
                  aria-invalid={Boolean(form.formState.errors.startDate)}
                  {...form.register("startDate")}
                />
              </Field>
              <Field
                label="End date"
                htmlFor="endDate"
                required
                error={form.formState.errors.endDate?.message}
              >
                <Input
                  id="endDate"
                  type="date"
                  min={values.startDate ? toDateInputValue(values.startDate) : toDateInputValue(new Date())}
                  aria-invalid={Boolean(form.formState.errors.endDate)}
                  {...form.register("endDate")}
                />
              </Field>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Pick how long you intend to stay. The total is calculated from the nightly rate.
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <dl className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Room</dt>
                  <dd className="text-right font-medium">{selectedRoom?.title ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Dates</dt>
                  <dd className="text-right font-medium">
                    {values.startDate} → {values.endDate}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Nights</dt>
                  <dd className="text-right font-medium tabular-nums">{nights}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Nightly rate</dt>
                  <dd className="text-right font-medium tabular-nums">
                    {selectedRoom ? formatCurrency(selectedRoom.rent, selectedRoom.currency) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
                  <dt className="font-medium">Estimated total</dt>
                  <dd className="text-right font-semibold tabular-nums">
                    {selectedRoom ? formatCurrency(total, selectedRoom.currency) : "—"}
                  </dd>
                </div>
              </dl>

              <Field
                label="Message to the owner"
                htmlFor="message"
                hint="Optional"
                error={form.formState.errors.message?.message}
              >
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Tell the owner a little about yourself and your stay."
                  {...form.register("message")}
                />
              </Field>

              <p className="text-xs text-muted-foreground">{platformFeeNote}</p>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || submitting}
            >
              <ChevronLeft />
              Back
            </Button>

            {step < 2 ? (
              <Button
                type="button"
                onClick={async () => {
                  const fields: (keyof BookingValues)[] =
                    step === 0 ? ["roomId"] : ["startDate", "endDate"];
                  const valid = await form.trigger(fields, { shouldFocus: true });
                  if (valid) setStep((current) => Math.min(2, current + 1));
                }}
              >
                Continue
                <ChevronRight />
              </Button>
            ) : (
              <Button type="submit" loading={submitting}>
                Send booking request
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
