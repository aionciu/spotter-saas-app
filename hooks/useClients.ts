"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Client } from "@/lib/types/client";

/**
 * Response type for clients API
 */
interface ClientsResponse {
  clients: Client[];
}

/**
 * Hook for fetching clients data
 * 
 * Uses React Query to fetch and cache clients data.
 * Provides loading, error, and data states.
 */
export function useClients() {
  return useQuery<ClientsResponse>({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      return response.json();
    },
  });
}

/**
 * Hook for creating a new client
 * 
 * Returns a mutation function that can be called to create a client.
 * Automatically invalidates the clients query on success.
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      gender?: "male" | "female" | "other" | null;
      notes?: string | null;
    }) => {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create client");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook for updating a client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        gender?: "male" | "female" | "other" | null;
        notes?: string | null;
      };
    }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update client");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook for deleting a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete client");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

