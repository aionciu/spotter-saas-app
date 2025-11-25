"use client";

import { useQuery } from "@tanstack/react-query";
import type { Package } from "@/lib/types/package";

/**
 * Response type for packages API
 */
interface PackagesResponse {
  packages: Package[];
}

/**
 * Hook for fetching packages for a client
 * 
 * Uses React Query to fetch and cache packages data.
 * Provides loading, error, and data states.
 */
export function usePackages(clientId: string) {
  return useQuery<PackagesResponse>({
    queryKey: ["packages", clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}/packages`);
      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }
      return response.json();
    },
    enabled: !!clientId,
  });
}

