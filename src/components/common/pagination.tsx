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
import { useLocale, useTranslation } from "@/components/providers/locale-provider";
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
  const t = useTranslation();
  const { locale } = useLocale();
  const currentPageSize = useQueryParam("pageSize");
  const { setPage, isPending } = useUrlState();

  const pages = buildWindow(meta.page, meta.totalPages);

  if (meta.totalItems === 0) return null;

  return (
    <nav aria-label={t("pagination.label")} className={cn("flex flex-col items-center justify-between gap-3 sm:flex-row", className)}>
      <p className="text-sm text-muted-foreground">
        {t("pagination.summary", {
          page: meta.page,
          total: meta.totalPages,
          count: meta.totalItems.toLocaleString(locale === "bn" ? "bn-BD" : "en-GB"),
        })}
      </p>

      <div className="flex items-center gap-2" data-pending={isPending || undefined}>
        {showPageSize ? (
          <Select
            value={currentPageSize || String(meta.pageSize || DEFAULT_PAGE_SIZE)}
            onValueChange={(value) => setPage(1, Number(value))}
          >
            <SelectTrigger className="h-9 w-[7.5rem]" aria-label={t("pagination.perPage")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / {t("pagination.page")}
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
            aria-label={t("action.previous")}
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
                  aria-label={t("pagination.pageNumber", { page })}
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
            aria-label={t("action.next")}
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
