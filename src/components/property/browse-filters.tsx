"use client";

import { SearchX, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActiveFilterChips, FilterSelect, SearchInput, SortSelect, useUrlState } from "@/components/common/url-state";
import { useTranslation } from "@/components/providers/locale-provider";

const PROPERTY_SORTS = [
  { value: "publishedAt:desc", key: "property.sortNewest" },
  { value: "title:asc", key: "property.sortTitle" },
  { value: "city:asc", key: "property.sortCity" },
];

const ROOM_SORTS = [
  { value: "rent:asc", key: "property.sortRentLow" },
  { value: "rent:desc", key: "property.sortRentHigh" },
  { value: "area:desc", key: "property.sortLargest" },
];

const PRICE_BANDS = [
  { value: "0-400", key: "browse.price.upTo400" },
  { value: "400-800", key: "browse.price.400to800" },
  { value: "800-1200", key: "browse.price.800to1200" },
  { value: "1200-", key: "browse.price.1200plus" },
];

const BEDROOM_OPTIONS = [
  { value: "1", key: "browse.beds.1" },
  { value: "2", key: "browse.beds.2" },
  { value: "3", key: "browse.beds.3" },
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
  const t = useTranslation();

  const sorts = view === "rooms" ? ROOM_SORTS : PROPERTY_SORTS;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <SearchInput
            paramKey="search"
            label={t(view === "rooms" ? "browse.searchRooms" : "browse.searchProperties")}
            placeholder={t("property.searchPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-end">
          {view === "properties" ? (
            <FilterSelect
              paramKey="city"
              label={t("property.city")}
              allLabel={t("property.allCities")}
              options={cities.map((city) => ({ value: city, label: city }))}
            />
          ) : (
            <>
              <FilterSelect
                paramKey="price"
                label={t("browse.rentLabel")}
                allLabel={t("property.anyRent")}
                options={PRICE_BANDS.map((band) => ({ value: band.value, label: t(band.key) }))}
              />
              <FilterSelect
                paramKey="bedrooms"
                label={t("property.bedrooms")}
                allLabel={t("property.anySize")}
                options={BEDROOM_OPTIONS.map((option) => ({ value: option.value, label: t(option.key) }))}
              />
            </>
          )}

          <SortSelect
            options={sorts.map((sort) => ({ value: sort.value, label: t(sort.key) }))}
            label={t("action.sortBy")}
          />
        </div>
      </div>

      <ActiveFilterChips
        labels={{
          search: t("action.search"),
          city: t("property.city"),
          price: t("browse.rentLabel"),
          bedrooms: t("property.bedrooms"),
        }}
      />

      {view === "rooms" ? <RoomAvailabilityFilters /> : null}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
          {t("browse.toolbarNote")}
        </p>
        {hasActiveFilters(searchParams) ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => clearParams()}>
            <SearchX />
            {t("action.clearAll")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Available-from date, sent to `/rooms` as `availableFrom`. */
function RoomAvailabilityFilters() {
  const { searchParams, setParams } = useUrlState();
  const t = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="w-full sm:w-56">
        <label htmlFor="availableFrom" className="mb-1.5 block text-sm font-medium">
          {t("property.availableFrom")}
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