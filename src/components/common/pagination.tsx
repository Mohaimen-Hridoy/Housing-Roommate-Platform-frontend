"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryParam, useUrlState } from "@/components/common/url-state";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/types/api";

const PAGE_SIZES = [6, 12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;

interface PaginationProps {
  meta: PaginationMeta;
  className?: string;
  showPageSize?: boolean;
}

/**
 * URL-driven pagination — page and page size live in the query string, so the
 * current view can be bookmarked or shared.
 */
export function Pagination({ meta, className, showPageSize = true }: PaginationProps) {
  const currentPageSize = useQueryParam("pageSize");
  const { setPage, isPending } = useUrlState();

  const pages = buildWindow(meta.page, meta.totalPages);

  if (meta.totalItems === 0) return null;

  return (
    <nav aria-label="Pagination" className={cn("flex flex-col items-center justify-between gap-3 sm:flex-row", className)}>
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{meta.page}</span> of {meta.totalPages} ·{" "}
        {meta.totalItems.toLocaleString()} result{meta.totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex items-center gap-2" data-pending={isPending || undefined}>
        {showPageSize ? (
          <Select
            value={currentPageSize || String(meta.pageSize || DEFAULT_PAGE_SIZE)}
            onValueChange={(value) => setPage(1, Number(value))}
          >
            <SelectTrigger className="h-9 w-[7.5rem]" aria-label="Results per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={!meta.hasPrevPage}
            onClick={() => setPage(meta.page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {pages.map((page, index) => {
            const previous = pages[index - 1];
            const showGap = previous !== undefined && page - previous > 1;
            return (
              <span key={page} className="flex items-center gap-1">
                {showGap ? <span className="px-1 text-muted-foreground">…</span> : null}
                <Button
                  type="button"
                  variant={page === meta.page ? "default" : "outline"}
                  size="icon-sm"
                  aria-label={`Page ${page}`}
                  aria-current={page === meta.page ? "page" : undefined}
                  onClick={() => setPage(page)}
                >
                  {page}
                </Button>
              </span>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={!meta.hasNextPage}
            onClick={() => setPage(meta.page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function buildWindow(current: number, total: number): number[] {
  const set = new Set<number>([1, total, current]);
  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page >= 1 && page <= total) set.add(page);
  }
  return [...set].sort((a, b) => a - b);
}
