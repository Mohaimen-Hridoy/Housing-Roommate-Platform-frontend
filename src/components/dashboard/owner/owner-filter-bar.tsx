"use client";

import {
  ActiveFilterChips,
  FilterSelect,
  SearchInput,
  SortSelect,
} from "@/components/common/url-state";

interface OwnerFilterBarProps {
  /** Omit to hide the search box — the API filter it maps to must exist. */
  searchParamKey?: string;
  searchPlaceholder?: string;
  statusParamKey?: string;
  statusLabel?: string;
  statusAllLabel?: string;
  statusOptions: { value: string; label: string }[];
  sortOptions: { value: string; label: string }[];
  chipLabels?: Record<string, string>;
  /** Extra URL-synced control rendered next to the standard ones. */
  extra?: React.ReactNode;
}

/** Shared filter/search/sort toolbar so every owner list is URL-driven. */
export function OwnerFilterBar({
  searchParamKey,
  searchPlaceholder = "Search…",
  statusParamKey = "status",
  statusLabel = "Status",
  statusAllLabel = "All statuses",
  statusOptions,
  sortOptions,
  chipLabels,
  extra,
}: OwnerFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {searchParamKey ? (
          <SearchInput paramKey={searchParamKey} placeholder={searchPlaceholder} className="w-full sm:w-72" />
        ) : null}
        <FilterSelect
          paramKey={statusParamKey}
          label={statusLabel}
          allLabel={statusAllLabel}
          options={statusOptions}
        />
        <SortSelect options={sortOptions} label="Sort" />
        {extra}
      </div>
      <ActiveFilterChips ignore={["page", "pageSize", "sortBy", "sortOrder"]} labels={chipLabels} />
    </div>
  );
}