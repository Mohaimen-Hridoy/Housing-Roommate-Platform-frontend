"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldRow } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { PropertyStatusBadge } from "@/components/common/status-badge";
import { useOwnerMutation } from "@/components/dashboard/owner/use-owner-mutation";
import { cn } from "@/lib/utils";
import type { Amenity, PropertyDetail, PropertyInput, PropertyStatus } from "@/lib/types/api";

const detailsSchema = z.object({
  title: z.string().trim().min(3, "Give the property a title of at least 3 characters").max(200, "Title is too long"),
  description: z.string().trim().max(2000, "Keep the description under 2000 characters").default(""),
  address: z.string().trim().min(3, "Street address is required").max(300, "Address is too long"),
  city: z.string().trim().min(2, "City is required").max(120),
  state: z.string().trim().max(120).default(""),
  postalCode: z.string().trim().max(24).default(""),
  country: z.string().trim().min(2, "Country is required").max(60).default("US"),
  lat: z
    .string()
    .trim()
    .default("")
    .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= -90 && Number(value) <= 90), {
      message: "Latitude must be between -90 and 90",
    }),
  lng: z
    .string()
    .trim()
    .default("")
    .refine(
      (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= -180 && Number(value) <= 180),
      { message: "Longitude must be between -180 and 180" },
    ),
});

type DetailsValues = z.infer<typeof detailsSchema>;

function toFormValues(property: PropertyDetail): DetailsValues {
  return {
    title: property.title,
    description: property.description ?? "",
    address: property.address,
    city: property.city,
    state: property.state ?? "",
    postalCode: property.postalCode ?? "",
    country: property.country ?? "US",
    lat: property.lat === null ? "" : String(property.lat),
    lng: property.lng === null ? "" : String(property.lng),
  };
}

interface DetailsPanelProps {
  property: PropertyDetail;
  allAmenities: Amenity[];
}

interface StatusAction {
  status: PropertyStatus;
  label: string;
  icon: typeof Eye;
  variant: "success" | "outline" | "ghost";
}

const STATUS_ACTIONS: StatusAction[] = [
  { status: "PUBLISHED", label: "Publish", icon: Eye, variant: "success" },
  { status: "DRAFT", label: "Move to draft", icon: EyeOff, variant: "outline" },
  { status: "ARCHIVED", label: "Archive", icon: Archive, variant: "ghost" },
];

/** Details tab: validated edit form, publishing controls and amenity management. */
export function DetailsPanel({ property, allAmenities }: DetailsPanelProps) {
  const { pendingKey, run } = useOwnerMutation();
  const [attached, setAttached] = useState<string[]>(() => property.amenities.map((amenity) => amenity.id));
  const [status, setStatus] = useState<PropertyStatus>(property.status);

  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: toFormValues(property),
    mode: "onChange",
  });

  const errors = form.formState.errors;
  const saving = pendingKey === "save";

  const save = form.handleSubmit(async (submitted) => {
    const payload: Partial<PropertyInput> = {
      title: submitted.title,
      description: submitted.description || undefined,
      address: submitted.address,
      city: submitted.city,
      state: submitted.state || undefined,
      postalCode: submitted.postalCode || undefined,
      country: submitted.country,
      lat: submitted.lat === "" ? undefined : Number(submitted.lat),
      lng: submitted.lng === "" ? undefined : Number(submitted.lng),
    };

    const saved = await run<PropertyDetail>("save", `/properties/${property.id}`, {
      method: "PATCH",
      body: payload,
      successMessage: "Listing details saved.",
    });
    if (saved) form.reset(toFormValues(saved));
  });

  const changeStatus = async (next: PropertyStatus) => {
    const previous = status;
    setStatus(next);
    const saved = await run<PropertyDetail>(`status-${next}`, `/properties/${property.id}`, {
      method: "PATCH",
      body: { status: next },
      successMessage:
        next === "PUBLISHED"
          ? "Listing published."
          : next === "ARCHIVED"
            ? "Listing archived."
            : "Listing moved to draft.",
    });
    if (!saved) setStatus(previous);
  };

  const toggleAmenity = async (amenityId: string, next: boolean) => {
    const previous = attached;
    setAttached(next ? [...attached, amenityId] : attached.filter((id) => id !== amenityId));

    const path = `/properties/${property.id}/amenities${next ? "" : `/${amenityId}`}`;
    const result = await run<unknown>(`amenity-${amenityId}`, path, {
      method: next ? "POST" : "DELETE",
      body: next ? { amenityId } : undefined,
      successMessage: next ? "Amenity attached." : "Amenity removed.",
    });

    if (result === null) setAttached(previous);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Publishing</h3>
              <p className="text-sm text-muted-foreground">
                Only published listings appear in public search. Publishing stamps a{" "}
                <code className="font-mono text-xs">publishedAt</code> date on the record.
              </p>
            </div>
            <PropertyStatusBadge status={status} />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isCurrent = status === action.status;
              return (
                <Button
                  key={action.status}
                  type="button"
                  variant={action.variant}
                  size="sm"
                  disabled={isCurrent}
                  loading={pendingKey === `status-${action.status}`}
                  onClick={() => void changeStatus(action.status)}
                >
                  <Icon />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <h3 className="text-base font-semibold">Listing details</h3>

          <form onSubmit={save} noValidate className="space-y-4">
            <Field label="Property title" htmlFor="details-title" error={errors.title?.message} required>
              <Input id="details-title" aria-invalid={Boolean(errors.title)} {...form.register("title")} />
            </Field>

            <Field label="Description" htmlFor="details-description" hint="Optional" error={errors.description?.message}>
              <Textarea id="details-description" aria-invalid={Boolean(errors.description)} {...form.register("description")} />
            </Field>

            <Field label="Street address" htmlFor="details-address" error={errors.address?.message} required>
              <Input id="details-address" aria-invalid={Boolean(errors.address)} {...form.register("address")} />
            </Field>

            <FieldRow>
              <Field label="City" htmlFor="details-city" error={errors.city?.message} required>
                <Input id="details-city" aria-invalid={Boolean(errors.city)} {...form.register("city")} />
              </Field>
              <Field label="State or region" htmlFor="details-state" hint="Optional">
                <Input id="details-state" {...form.register("state")} />
              </Field>
            </FieldRow>

            <FieldRow>
              <Field label="Postal code" htmlFor="details-postal" hint="Optional">
                <Input id="details-postal" {...form.register("postalCode")} />
              </Field>
              <Field label="Country" htmlFor="details-country" error={errors.country?.message} required>
                <Input id="details-country" aria-invalid={Boolean(errors.country)} {...form.register("country")} />
              </Field>
            </FieldRow>

            <FieldRow>
              <Field label="Latitude" htmlFor="details-lat" hint="Optional" error={errors.lat?.message}>
                <Input id="details-lat" inputMode="decimal" aria-invalid={Boolean(errors.lat)} {...form.register("lat")} />
              </Field>
              <Field label="Longitude" htmlFor="details-lng" hint="Optional" error={errors.lng?.message}>
                <Input id="details-lng" inputMode="decimal" aria-invalid={Boolean(errors.lng)} {...form.register("lng")} />
              </Field>
            </FieldRow>

            <Button type="submit" loading={saving}>
              <Save />
              Save details
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Amenities</h3>
            <p className="text-sm text-muted-foreground">
              Owners can only attach amenities that already exist on the platform — creating new ones is an
              administrator action.
            </p>
          </div>

          {allAmenities.length === 0 ? (
            <Alert variant="warning">
              <AlertDescription>
                No amenities are configured yet. Ask an administrator to create them, then attach them here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allAmenities.map((amenity) => {
                const id = `property-amenity-${amenity.id}`;
                const checked = attached.includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    htmlFor={id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                      checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                    )}
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      disabled={pendingKey === `amenity-${amenity.id}`}
                      onCheckedChange={(next) => void toggleAmenity(amenity.id, next === true)}
                    />
                    <span className="min-w-0 flex-1 truncate">{amenity.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
