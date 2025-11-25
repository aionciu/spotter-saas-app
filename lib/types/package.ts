import type { Tables } from "@/lib/supabase/types";

/**
 * Package type from database
 */
export type Package = Tables<"packages">;

/**
 * Package creation input
 */
export interface CreatePackageInput {
  client_id: string;
  total_sessions: number;
  expiration_date?: string | null;
}

/**
 * Package update input
 */
export interface UpdatePackageInput {
  total_sessions?: number;
  remaining_sessions?: number;
  expiration_date?: string | null;
  is_active?: boolean;
}

/**
 * Package with client information
 */
export interface PackageWithClient extends Package {
  client?: {
    id: string;
    name: string;
  };
}

