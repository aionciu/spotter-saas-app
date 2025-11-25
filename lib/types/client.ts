import type { Tables } from "@/lib/supabase/types";

/**
 * Client type from database
 */
export type Client = Tables<"clients">;

/**
 * Client gender
 */
export type ClientGender = "male" | "female" | "other";

/**
 * Client with related data
 */
export interface ClientWithPackages extends Client {
  packages?: Array<{
    id: string;
    total_sessions: number;
    remaining_sessions: number;
    is_active: boolean;
  }>;
}

/**
 * Client creation input
 */
export interface CreateClientInput {
  name: string;
  gender?: ClientGender | null;
  notes?: string | null;
}

/**
 * Client update input
 */
export interface UpdateClientInput {
  name?: string;
  gender?: ClientGender | null;
  notes?: string | null;
}

