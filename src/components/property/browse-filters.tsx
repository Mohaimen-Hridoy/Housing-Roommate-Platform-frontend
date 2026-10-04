"use client";

import { SearchX, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActiveFilterChips, FilterSelect, SearchInput, SortSelect, useUrlState } from "@/components/common/url-state";

const PROPERTY_SORTS = [
  { value: "publishedAt:desc", label: "Newest first" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "city:asc", label: "City A–Z" },
];

const ROOM_SORTS = [
  { value: "rent:asc", label: "Rent: low to high" },
  { value: "rent:desc", label: "Rent: high to low" },
  { value: "area:desc", label: "Largest first" },
];

const PRICE_BANDS = [
  { value: "0-400", label: "Up to 400" },
  { value: "400-800", label: "400 – 800" },
  { value: "800-1200", label: "800 – 1,200" },
  { value: "1200-", label: "1,200 and above" },
];

const BEDROOM_OPTIONS = [
  { value: "1", label: "1+ bedroom" },
  { value: "2", label: "2+ bedrooms" },
  { value: "3", label: "3+ bedrooms" },
];

interface BrowseFiltersProps {
  view: "properties" | "rooms";
  /** City names taken from the live result set, so the filter only offers real values. */
  cities: string[];
}

/**
 * Every control writes to the query string, so a filtered view is
 * bookmarkable, shareable and survives a refresh. Changing any filter resets
 * `page` back to 1 (handled by `useUrlState`).
 */
export function BrowseFilters({ view, cities }: BrowseFiltersProps) {
  const { searchParams, clearParams } = useUrlState();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <SearchInput
            paramKey="search"
            label={view === "rooms" ? "Search rooms" : "Search properties"}
            placeholder={
              view === "rooms" ? "Search by room title or property…" : "Search by title, city or address…"
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-end">
          {view === "properties" ? (
            <FilterSelect
              paramKey="city"
              label="City"
              allLabel="All cities"
              options={cities.map((city) => ({ value: city, label: city }))}
            />
          ) : (
            <>
              <FilterSelect
                paramKey="price"
                label="Monthly rent"
                allLabel="Any rent"
                options={PRICE_BANDS}
              />
              <FilterSelect
                paramKey="bedrooms"
                label="Bedrooms"
                allLabel="Any size"
                options={BEDROOM_OPTIONS}
              />
            </>
          )}

          <SortSelect
            options={view === "rooms" ? ROOM_SORTS : PROPERTY_SORTS}
            label="Sort by"
          />
        </div>
      </div>

      <ActiveFilterChips
        labels={{
          search: "Search",
          city: "City",
          price: "Rent",
          bedrooms: "Bedrooms",
        }}
      />

      {view === "rooms" ? <RoomAvailabilityFilters /> : null}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
          Filters are stored in the URL — bookmark or share this exact view.
        </p>
        {hasActiveFilters(searchParams) ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => clearParams()}>
            <SearchX />
            Clear all
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Available-from date, sent to `/rooms` as `availableFrom`. */
function RoomAvailabilityFilters() {
  const { searchParams, setParams } = useUrlState();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="w-full sm:w-56">
        <label htmlFor="availableFrom" className="mb-1.5 block text-sm font-medium">
          Available from
        </label>
        <Input
          id="availableFrom"
          type="date"
          value={searchParams.get("availableFrom") ?? ""}
          onChange={(event) => setParams({ availableFrom: event.target.value || undefined })}
        />
      </div>
    </div>
  );
}

const FILTER_KEYS = ["search", "city", "price", "bedrooms", "availableFrom"];

function hasActiveFilters(params: URLSearchParams): boolean {
  return FILTER_KEYS.some((key) => {
    const value = params.get(key);
    return Boolean(value) && value !== "ALL";
  });
}