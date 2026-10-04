"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search as SearchIcon, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

/** Reads a single query-string value from `useSearchParams`. */
export function useQueryParam(key: string, fallback = ""): string {
  const searchParams = useSearchParams();
  return searchParams.get(key) ?? fallback;
}

export function useQueryInt(key: string, fallback: number): number {
  const raw = useQueryParam(key);
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Writes a patch of query-string values, always resetting `page` unless the
 * patch targets pagination itself. `scroll: false` keeps filter changes from
 * jumping the viewport.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParams = useCallback(
    (patch: Record<string, string | number | boolean | undefined | null>, options?: { keepPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null || value === "" || value === "ALL") params.delete(key);
        else params.set(key, String(value));
      }
      if (!options?.keepPage) params.delete("page");
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const setPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      if (pageSize !== undefined) {
        if (pageSize === 12) params.delete("pageSize");
        else params.set("pageSize", String(pageSize));
      }
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  /** Drops every query-string parameter, returning to the unfiltered view. */
  const clearParams = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  return { setParams, setPage, clearParams, isPending, searchParams };
}

interface SearchInputProps {
  placeholder?: string;
  /** Query-string key. When provided the value is synced to the URL. */
  paramKey?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  delay?: number;
  label?: string;
}

/**
 * Debounced search box. With `paramKey` the value is synchronised to the URL,
 * so any search result view is bookmarkable and shareable.
 */
export function SearchInput({
  placeholder = "Search…",
  paramKey,
  value,
  onValueChange,
  className,
  delay = 400,
  label = "Search",
}: SearchInputProps) {
  const urlValue = useQueryParam(paramKey ?? "__none__");
  const { setParams } = useUrlState();
  const controlled = value !== undefined;
  const [local, setLocal] = useState(controlled ? value : paramKey ? urlValue : "");
  const debounced = useDebounce(local, delay);
  const isFirst = useRef(true);
  const inputId = `search-${paramKey ?? "input"}`;

  useEffect(() => {
    if (controlled) setLocal(value);
    else if (paramKey) setLocal(urlValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled ? value : urlValue]);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    onValueChange?.(debounced);
    if (paramKey && !controlled) setParams({ [paramKey]: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Input
        id={inputId}
        type="search"
        value={local}
        placeholder={placeholder}
        onChange={(event) => setLocal(event.target.value)}
        className={cn("pr-9", local ? "[&::-webkit-search-cancel-button]:hidden" : undefined)}
      />
      {local ? (
        <button
          type="button"
          onClick={() => setLocal("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : (
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
    </div>
  );
}

interface FilterSelectProps {
  paramKey: string;
  value?: string;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
  allLabel?: string;
}

/** URL-synced `<Select>` for a single filter dimension. */
export function FilterSelect({
  paramKey,
  value,
  options,
  label,
  className,
  allLabel = "All",
}: FilterSelectProps) {
  const urlValue = useQueryParam(paramKey);
  const { setParams, isPending } = useUrlState();
  const current = value ?? urlValue;

  return (
    <div className={cn("min-w-[9.5rem]", className)} data-pending={isPending || undefined}>
      <span className="sr-only">{label}</span>{/* Empty string means "nothing chosen", which is what
        makes Radix render the placeholder. Passing "ALL" instead left the trigger blank, because no
        mounted item carried that value while the dropdown was closed. */}
      <Select value={current || ""} onValueChange={(next) => setParams({ [paramKey]: next || undefined })}>
        <SelectTrigger aria-label={label} className={cn(isPending && "opacity-70")}>
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__ALL__">{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface SortSelectProps {
  sortByParam?: string;
  sortOrderParam?: string;
  options: { value: string; label: string }[];
  label?: string;
  className?: string;
}

/** URL-synced sort control writing the `sortBy` + `sortOrder` pair. */
export function SortSelect({
  sortByParam = "sortBy",
  sortOrderParam = "sortOrder",
  options,
  label = "Sort",
  className,
}: SortSelectProps) {
  const sortBy = useQueryParam(sortByParam);
  const sortOrder = useQueryParam(sortOrderParam, "desc");
  const { setParams, isPending } = useUrlState();

  const commit = (next: string) => {
    const [field, direction] = next.split(":");
    setParams({ [sortByParam]: field, [sortOrderParam]: direction });
  };

  return (
    <div className={cn("min-w-[12rem]", className)} data-pending={isPending || undefined}>
      <span className="sr-only">{label}</span>
      <Select value={`${sortBy}:${sortOrder}`} onValueChange={commit}>
        <SelectTrigger aria-label={label} className={cn(isPending && "opacity-70")}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ActiveFilterChipsProps {
  /** Query keys to ignore (page/pageSize/sort). */
  ignore?: string[];
  labels?: Record<string, string>;
}

/** Renders removable chips for every active query-string filter. */
export function ActiveFilterChips({ ignore = ["page", "pageSize"], labels = {} }: ActiveFilterChipsProps) {
  const searchParams = useSearchParams();
  const { setParams } = useUrlState();

  const entries = [...searchParams.entries()].filter(
    ([key, value]) => !ignore.includes(key) && value !== "" && value !== "ALL",
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {entries.map(([key, value]) => (
        <button
          key={`${key}-${value}`}
          type="button"
          onClick={() => setParams({ [key]: undefined })}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <span className="text-muted-foreground">{labels[key] ?? key}:</span>
          {value}
          <X className="size-3" aria-hidden="true" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => setParams(Object.fromEntries(entries.map(([key]) => [key, undefined])))}
        className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  );
}
