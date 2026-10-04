"use client";

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import { apiClient, errorMessage } from "@/lib/api/client";
import type { PaginationMeta } from "@/lib/types/api";

interface PaginatedPayload<T> {
  items: T[];
  pagination: PaginationMeta;
}

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: 12,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function useApiQuery<T>(
  queryKey: readonly unknown[],
  path: string,
  options?: {
    query?: Record<string, string | number | boolean | undefined>;
    enabled?: boolean;
  },
) {
  return useQuery<T>({
    queryKey,
    queryFn: () => apiClient<T>(path, { query: options?.query }).then((result) => result.data),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    retry: 1,
  });
}

/** List query that unwraps the backend's `{ data, meta.pagination }` envelope. */
export function useApiList<T>(
  queryKey: readonly unknown[],
  path: string,
  options?: {
    query?: Record<string, string | number | boolean | undefined>;
    enabled?: boolean;
    queryOptions?: Partial<UseQueryOptions<PaginatedPayload<T>>>;
  },
): {
  items: T[];
  pagination: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
} {
  const query = useQuery<PaginatedPayload<T>>({
    queryKey,
    queryFn: async () => {
      const result = await apiClient<T[]>(path, { query: options?.query });
      return { items: result.data ?? [], pagination: result.meta?.pagination ?? EMPTY_PAGINATION };
    },
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    retry: 1,
    ...options?.queryOptions,
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? EMPTY_PAGINATION,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? errorMessage(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

interface MutationOptions<TVariables, TResult> {
  path: string;
  method?: "POST" | "PATCH" | "PUT" | "DELETE";
  buildBody?: (variables: TVariables) => unknown;
  buildFormData?: (variables: TVariables) => FormData;
  onSuccess?: (data: TResult, variables: TVariables) => void | Promise<void>;
  invalidate?: readonly unknown[][];
  successMessage?: string | ((data: TResult, variables: TVariables) => string);
}

/** Mutation helper that reports failures through Sonner and invalidates caches. */
export function useApiMutation<TVariables, TResult = unknown>({
  path,
  method = "POST",
  buildBody,
  buildFormData,
  onSuccess,
  invalidate = [],
  successMessage,
}: MutationOptions<TVariables, TResult>) {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const result = await apiClient<TResult>(path, {
        method,
        body: buildBody?.(variables),
        formData: buildFormData?.(variables),
      });
      return result.data;
    },
    onSuccess: async (data, variables) => {
      for (const key of invalidate) {
        await queryClient.invalidateQueries({ queryKey: key });
      }
      await onSuccess?.(data, variables);
    },
  });
}
