"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Building2, Check, CircleCheck, MapPin, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldRow } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiClient, errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Amenity, PropertyDetail, PropertyInput } from "@/lib/types/api";

const wizardSchema = z.object({
  title: z.string().trim().min(3, "Give the property a title of at least 3 characters").max(200, "Title is too long"),
  description: z.string().trim().max(2000, "Keep the description under 2000 characters").default(""),
  address: z.string().trim().min(3, "Street address is required").max(300, "Address is too long"),
  city: z.string().trim().min(2, "City is required").max(120),
  state: z.string().trim().max(120, "State or region is too long").default(""),
  postalCode: z.string().trim().max(24, "Postal code is too long").default(""),
  country: z.string().trim().min(2, "Country is required").max(60).default("US"),
  lat: z
    .string()
    .trim()
    .default("")
    .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= -90 && Number(value) <= 90), {
      message: "Latitude must be a number between -90 and 90",
    }),
  lng: z
    .string()
    .trim()
    .default("")
    .refine(
      (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= -180 && Number(value) <= 180),
      { message: "Longitude must be a number between -180 and 180" },
    ),
  amenities: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

type WizardValues = z.infer<typeof wizardSchema>;

interface WizardStep {
  title: string;
  description: string;
  fields: FieldPath<WizardValues>[];
}

const STEPS: WizardStep[] = [
  {
    title: "Basics",
    description: "What is this property called, and what makes it worth renting?",
    fields: ["title", "description"],
  },
  {
    title: "Location",
    description: "Where is it? Coordinates are optional but help tenants find it.",
    fields: ["address", "city", "state", "postalCode", "country", "lat", "lng"],
  },
  {
    title: "Amenities",
    description: "Pick everything the property offers. Owners cannot create amenities, only attach existing ones.",
    fields: ["amenities"],
  },
  {
    title: "Review & publish",
    description: "Check the summary, then save as a draft or publish it immediately.",
    fields: ["status"],
  },
];

const DEFAULT_VALUES: WizardValues = {
  title: "",
  description: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  lat: "",
  lng: "",
  amenities: [],
  status: "DRAFT",
};

interface ListingWizardProps {
  allAmenities: Amenity[];
}

export function ListingWizard({ allAmenities }: ListingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const values = form.watch();
  const errors = form.formState.errors;
  const isLastStep = step === STEPS.length - 1;

  const goNext = async () => {
    const valid = await form.trigger(STEPS[step].fields, { shouldFocus: true });
    if (!valid) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const toggleAmenity = (amenityId: string, checked: boolean) => {
    const current = form.getValues("amenities");
    form.setValue(
      "amenities",
      checked ? [...current, amenityId] : current.filter((id) => id !== amenityId),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const onSubmit = form.handleSubmit(async (submitted) => {
    setSubmitting(true);
    try {
      const payload: PropertyInput = {
        title: submitted.title,
        description: submitted.description || undefined,
        address: submitted.address,
        city: submitted.city,
        state: submitted.state || undefined,
        postalCode: submitted.postalCode || undefined,
        country: submitted.country,
        lat: submitted.lat === "" ? undefined : Number(submitted.lat),
        lng: submitted.lng === "" ? undefined : Number(submitted.lng),
        status: submitted.status,
        amenities: submitted.amenities,
      };

      const result = await apiClient<PropertyDetail>("/properties", { method: "POST", body: payload });
      toast.success(
        submitted.status === "PUBLISHED"
          ? `“${result.data.title}” was created and published.`
          : `“${result.data.title}” was saved as a draft.`,
      );
      router.push(`/owner/listings/${result.data.id}`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {STEPS.map((entry, index) => {
          const isCurrent = index === step;
          const isDone = index < step;
          return (
            <li key={entry.title} className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  isDone && "border-success bg-success text-success-foreground",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  !isDone && !isCurrent && "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {isDone ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </button>
              <span className="hidden min-w-0 flex-1 sm:block">
                <span className={cn("block truncate text-sm font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                  {entry.title}
                </span>
              </span>
              {index < STEPS.length - 1 ? (
                <span aria-hidden="true" className="hidden h-px flex-1 bg-border sm:block" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{STEPS[step].title}</h2>
            <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
          </div>

          {step === 0 ? (
            <>
              <Field label="Property title" htmlFor="wizard-title" error={errors.title?.message} required>
                <Input
                  id="wizard-title"
                  placeholder="Sunny two-bedroom near the park"
                  aria-invalid={Boolean(errors.title)}
                  {...form.register("title")}
                />
              </Field>
              <Field
                label="Description"
                htmlFor="wizard-description"
                hint="Optional"
                error={errors.description?.message}
              >
                <Textarea
                  id="wizard-description"
                  placeholder="Describe the shared spaces, the neighbourhood and what makes the rooms comfortable."
                  aria-invalid={Boolean(errors.description)}
                  {...form.register("description")}
                />
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Field label="Street address" htmlFor="wizard-address" error={errors.address?.message} required>
                <Input
                  id="wizard-address"
                  placeholder="18 Elm Street"
                  aria-invalid={Boolean(errors.address)}
                  {...form.register("address")}
                />
              </Field>
              <FieldRow>
                <Field label="City" htmlFor="wizard-city" error={errors.city?.message} required>
                  <Input
                    id="wizard-city"
                    placeholder="Lisbon"
                    aria-invalid={Boolean(errors.city)}
                    {...form.register("city")}
                  />
                </Field>
                <Field label="State or region" htmlFor="wizard-state" hint="Optional" error={errors.state?.message}>
                  <Input id="wizard-state" placeholder="Lisboa" aria-invalid={Boolean(errors.state)} {...form.register("state")} />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Postal code" htmlFor="wizard-postal" hint="Optional" error={errors.postalCode?.message}>
                  <Input
                    id="wizard-postal"
                    placeholder="1100-148"
                    aria-invalid={Boolean(errors.postalCode)}
                    {...form.register("postalCode")}
                  />
                </Field>
                <Field label="Country" htmlFor="wizard-country" error={errors.country?.message} required>
                  <Input
                    id="wizard-country"
                    placeholder="PT"
                    aria-invalid={Boolean(errors.country)}
                    {...form.register("country")}
                  />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Latitude" htmlFor="wizard-lat" hint="Optional" error={errors.lat?.message}>
                  <Input
                    id="wizard-lat"
                    inputMode="decimal"
                    placeholder="38.7223"
                    aria-invalid={Boolean(errors.lat)}
                    {...form.register("lat")}
                  />
                </Field>
                <Field label="Longitude" htmlFor="wizard-lng" hint="Optional" error={errors.lng?.message}>
                  <Input
                    id="wizard-lng"
                    inputMode="decimal"
                    placeholder="-9.1393"
                    aria-invalid={Boolean(errors.lng)}
                    {...form.register("lng")}
                  />
                </Field>
              </FieldRow>
            </>
          ) : null}

          {step === 2 ? (
            allAmenities.length === 0 ? (
              <Alert variant="warning">
                <AlertDescription>
                  No amenities exist on the platform yet. Amenities are created by an administrator, so you can continue
                  without selecting any and attach them later from the listing screen.
                </AlertDescription>
              </Alert>
            ) : (
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">
                  Amenities{" "}
                  <span className="font-normal text-muted-foreground">
                    ({values.amenities.length} selected — optional)
                  </span>
                </legend>
                {errors.amenities?.message ? (
                  <p className="text-xs font-medium text-destructive" role="alert">
                    {errors.amenities.message}
                  </p>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {allAmenities.map((amenity) => {
                    const id = `amenity-${amenity.id}`;
                    const checked = values.amenities.includes(amenity.id);
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
                          onCheckedChange={(next) => toggleAmenity(amenity.id, next === true)}
                        />
                        <span className="min-w-0 flex-1 truncate">{amenity.name}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <dl className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Title</dt>
                  <dd className="text-sm font-medium">{values.title || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">City</dt>
                  <dd className="text-sm font-medium">{values.city || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Address</dt>
                  <dd className="text-sm font-medium">
                    {[values.address, values.city, values.state, values.postalCode, values.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Description</dt>
                  <dd className="line-clamp-3 text-sm text-muted-foreground">{values.description || "Not provided"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Amenities</dt>
                  <dd className="flex flex-wrap gap-1.5 pt-1">
                    {values.amenities.length === 0 ? (
                      <span className="text-sm text-muted-foreground">None selected</span>
                    ) : (
                      values.amenities.map((amenityId) => {
                        const amenity = allAmenities.find((entry) => entry.id === amenityId);
                        return (
                          <Badge key={amenityId} variant="secondary">
                            {amenity?.name ?? amenityId}
                          </Badge>
                        );
                      })
                    )}
                  </dd>
                </div>
              </dl>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Save as</legend>
                <RadioGroup
                  value={values.status}
                  onValueChange={(next) =>
                    form.setValue("status", next as WizardValues["status"], {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className="sm:grid-cols-2"
                >
                  {(
                    [
                      {
                        value: "DRAFT" as const,
                        title: "Draft",
                        description: "Only you can see it. Publish later from the listing screen.",
                        icon: Building2,
                      },
                      {
                        value: "PUBLISHED" as const,
                        title: "Published",
                        description: "Visible in public search straight away. You can add rooms afterwards.",
                        icon: Sparkles,
                      },
                    ]
                  ).map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        htmlFor={`status-${option.value}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                          values.status === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                        )}
                      >
                        <RadioGroupItem id={`status-${option.value}`} value={option.value} className="mt-0.5" />
                        <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{option.title}</span>
                          <span className="block text-xs text-muted-foreground">{option.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
                {errors.status?.message ? (
                  <p className="text-xs font-medium text-destructive" role="alert">
                    {errors.status.message}
                  </p>
                ) : null}
              </fieldset>

              <Alert variant="default">
                <CircleCheck className="shrink-0" aria-hidden="true" />
                <AlertDescription>
                  Creating the listing sends one <code className="font-mono text-xs">POST /properties</code> request. Add
                  rooms and photos from the listing screen once it exists.
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(s - 1, 0))}>
          <ArrowLeft />
          Back
        </Button>

        <p className="text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length} · <MapPin className="inline size-3" aria-hidden="true" /> location and
          amenities are optional extras
        </p>

        {isLastStep ? (
          <Button type="submit" loading={submitting}>
            {values.status === "PUBLISHED" ? "Create & publish" : "Create draft"}
            <ArrowRight />
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Continue
            <ArrowRight />
          </Button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        Step {step + 1} of {STEPS.length}: {STEPS[step].title}
      </p>
    </form>
  );
}