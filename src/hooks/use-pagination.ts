"use client";

import { useCallback, useMemo } from "react";

import { useUrlState, useQueryInt } from "@/components/common/url-state";

/**
 * Pagination hook that syncs with URL state.
 * Works with the existing `useUrlState` and `useQueryParam` utilities.
 */
export function usePagination(defaultPageSize = 12) {
  const page = useQueryInt("page", 1);
  const pageSize = useQueryInt("pageSize", defaultPageSize);
  const { setPage, setParams, isPending } = useUrlState();

  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const goToNext = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const goToPrevious = useCallback(() => {
    if (page > 1) goToPage(page - 1);
  }, [page, goToPage]);

  const changePageSize = useCallback(
    (newPageSize: number) => {
      setParams({ pageSize: newPageSize });
    },
    [setParams]
  );

  const paginationProps = useMemo(
    () => ({
      page,
      pageSize,
      totalPages: 0, // Set by consumer from pagination meta
      totalItems: 0, // Set by consumer from pagination meta
      goToPage,
      goToNext,
      goToPrevious,
      changePageSize,
      isPending,
    }),
    [page, pageSize, goToPage, goToNext, goToPrevious, changePageSize, isPending]
  );

  return paginationProps;
}

export function usePaginationMeta() {
  const { setParams } = useUrlState();

  return {
    setParams,
  };
}

export type UsePaginationReturn = ReturnType<typeof usePagination>;