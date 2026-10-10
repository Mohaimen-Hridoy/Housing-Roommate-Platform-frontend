"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiListSafe, type ClientQueryValue } from "@/lib/api/client";
import type { PropertyListItem, RoomListItem, Booking, ImageAsset, User, Payment, Amenity } from "@/lib/types/api";

type QueryParams = Record<string, ClientQueryValue>;

/** Key factories for query invalidation. */
export const queryKeys = {
  properties: (params: QueryParams) => ["properties", params] as const,
  property: (id: string) => ["property", id] as const,
  rooms: (params: QueryParams) => ["rooms", params] as const,
  room: (id: string) => ["room", id] as const,
  bookings: (params: QueryParams) => ["bookings", params] as const,
  booking: (id: string) => ["booking", id] as const,
  payments: (params: QueryParams) => ["payments", params] as const,
  users: (params: QueryParams) => ["users", params] as const,
  amenities: (params: QueryParams) => ["amenities", params] as const,
  images: (entityType: "property" | "room", id: string) => ["images", entityType, id] as const,
};

/** Fetch paginated properties with filters. */
export function useProperties(params: QueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.properties(params),
    queryFn: async () => {
      const result = await apiListSafe<PropertyListItem>("/properties", { query: params });
      return { items: result.items, pagination: result.pagination };
    },
    placeholderData: (prev) => prev,
  });
}

/** Fetch a single property by ID. */
export function useProperty(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.property(id),
    queryFn: async () => {
      const result = await apiClient<{ data: import("@/lib/types/api").PropertyDetail }>(`/properties/${id}`);
      return result.data;
    },
    enabled: enabled && Boolean(id),
  });
}

/** Fetch paginated rooms with filters. */
export function useRooms(params: QueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.rooms(params),
    queryFn: async () => {
      const result = await apiListSafe<RoomListItem>("/rooms", { query: params });
      return { items: result.items, pagination: result.pagination };
    },
    placeholderData: (prev) => prev,
  });
}

/** Fetch a single room by ID. */
export function useRoom(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.room(id),
    queryFn: async () => {
      const result = await apiClient<{ data: import("@/lib/types/api").RoomListItem }>(`/rooms/${id}`);
      return result.data;
    },
    enabled: enabled && Boolean(id),
  });
}

/** Fetch paginated bookings with filters. */
export function useBookings(params: QueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.bookings(params),
    queryFn: async () => {
      const result = await apiListSafe<Booking>("/bookings", { query: params });
      return { items: result.items, pagination: result.pagination };
    },
    placeholderData: (prev) => prev,
  });
}

/** Fetch a single booking by ID. */
export function useBooking(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: async () => {
      const result = await apiClient<{ data: Booking }>(`/bookings/${id}`);
      return result.data;
    },
    enabled: enabled && Boolean(id),
  });
}

/** Fetch paginated payments with filters. */
export function usePayments(params: QueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.payments(params),
    queryFn: async () => {
      const result = await apiListSafe<Payment>("/payments", { query: params });
      return { items: result.items, pagination: result.pagination };
    },
    placeholderData: (prev) => prev,
  });
}

/** Fetch paginated users with filters (admin only). */
export function useUsers(params: QueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: async () => {
      const result = await apiListSafe<User>("/users", { query: params });
      return { items: result.items, pagination: result.pagination };
    },
    placeholderData: (prev) => prev,
  });
}

/** Fetch paginated amenities with filters. */
export function useAmenities(params: QueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.amenities(params),
    queryFn: async () => {
      const result = await apiListSafe<Amenity>("/amenities", { query: params });
      return { items: result.items, pagination: result.pagination };
    },
    placeholderData: (prev) => prev,
  });
}

/** Fetch images for a property or room. */
export function useImages(entityType: "property" | "room", id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.images(entityType, id),
    queryFn: async () => {
      const result = await apiClient<{ data: ImageAsset[] }>(`/${entityType}s/${id}/images`);
      return result.data;
    },
    enabled: enabled && Boolean(id),
  });
}

/** Mutation hook for creating a booking. */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { roomId: string; checkIn: string; checkOut: string }) => {
      const result = await apiClient<{ data: Booking }>("/bookings", {
        method: "POST",
        body: data,
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

/** Mutation hook for cancelling a booking. */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const result = await apiClient<{ data: Booking }>(`/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

/** Mutation hook for creating a property. */
export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await apiClient<{ data: import("@/lib/types/api").PropertyDetail }>("/properties", {
        method: "POST",
        body: data,
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

/** Mutation hook for updating a property. */
export function useUpdateProperty(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await apiClient<{ data: import("@/lib/types/api").PropertyDetail }>(`/properties/${propertyId}`, {
        method: "PATCH",
        body: data,
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
    },
  });
}

/** Mutation hook for uploading images. */
export function useUploadImages(entityType: "property" | "room", entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await apiClient<{ data: ImageAsset[] }>(`/${entityType}s/${entityId}/images`, {
        method: "POST",
        formData,
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.images(entityType, entityId) });
    },
  });
}

/** Mutation hook for setting primary image. */
export function useSetPrimaryImage(entityType: "property" | "room", imageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await apiClient<{ data: ImageAsset }>(`/images/${imageId}/primary`, {
        method: "PATCH",
        body: {},
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

/** Mutation hook for deleting an image. */
export function useDeleteImage(entityType: "property" | "room", entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: string) => {
      await apiClient(`/images/${imageId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.images(entityType, entityId) });
    },
  });
}

/** Mutation hook for updating user role (admin). */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "ADMIN" | "OWNER" | "TENANT" }) => {
      const result = await apiClient<{ data: User }>(`/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/** Mutation hook for updating room status (owner). */
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roomId, status }: { roomId: string; status: string }) => {
      const result = await apiClient<{ data: RoomListItem }>(`/rooms/${roomId}/status`, {
        method: "PATCH",
        body: { status },
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

/** Mutation hook for creating a payment intent. */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const result = await apiClient<{ data: { checkoutUrl?: string; clientSecret?: string; provider: string } }>(`/bookings/${bookingId}/checkout`, {
        method: "POST",
      });
      return result.data;
    },
  });
}