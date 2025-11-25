"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Package } from "@/lib/types/package";
import type { CreatePackageInput, UpdatePackageInput } from "@/lib/types/package";

/**
 * Response type for packages API
 */
interface PackagesResponse {
  packages: Package[];
}

/**
 * Response type for single package API
 */
interface PackageResponse {
  package: Package;
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

/**
 * Hook for creating a new package
 * 
 * Returns a mutation function that can be called to create a package.
 * Automatically invalidates the packages query on success.
 */
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      data,
    }: {
      clientId: string;
      data: CreatePackageInput;
    }) => {
      const response = await fetch(`/api/clients/${clientId}/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create package");
      }

      return response.json() as Promise<PackageResponse>;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch packages list
      queryClient.invalidateQueries({ queryKey: ["packages", variables.clientId] });
      // Also invalidate clients query to update active package status
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook for updating a package
 * 
 * Note: API endpoint not yet implemented. This is a placeholder for future use.
 */
export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      packageId,
      clientId,
      data,
    }: {
      packageId: string;
      clientId: string;
      data: UpdatePackageInput;
    }) => {
      // TODO: Implement API endpoint /api/packages/[id]
      throw new Error("Package update not yet implemented");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["packages", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

