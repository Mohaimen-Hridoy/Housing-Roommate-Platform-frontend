"use client";

import { useCallback, useMemo, useState } from "react";

interface PaginationState {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  /** Params object ready to spread into an API query. */
  query: { page: number; pageSize: number };
  reset: () => void;
}

/** Client-side pagination state for lists fetched through TanStack Query. */
export function usePagination(initialPage = 1, initialPageSize = 10): PaginationState {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPage = useCallback((next: number) => setPageState(Math.max(1, next)), []);

  const setPageSize = useCallback((next: number) => {
    setPageSizeState(next);
    setPageState(1);
  }, []);

  const reset = useCallback(() => setPageState(1), []);

  const query = useMemo(() => ({ page, pageSize }), [page, pageSize]);

  return { page, pageSize, setPage, setPageSize, query, reset };
}
