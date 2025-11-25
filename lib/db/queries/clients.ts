import { createServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type Client = Tables<"clients">;
export type ClientInsert = TablesInsert<"clients">;
export type ClientUpdate = TablesUpdate<"clients">;

/**
 * Get all clients for a trainer
 */
export async function getClientsByTrainerId(trainerId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get clients: ${error.message}`);
  }

  return data;
}

/**
 * Get client by ID
 */
export async function getClientById(clientId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error) {
    throw new Error(`Failed to get client: ${error.message}`);
  }

  return data;
}

/**
 * Create a new client
 */
export async function createClient(clientData: ClientInsert) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("clients")
    .insert(clientData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create client: ${error.message}`);
  }

  return data;
}

/**
 * Update client
 */
export async function updateClient(clientId: string, updates: ClientUpdate) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", clientId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update client: ${error.message}`);
  }

  return data;
}

/**
 * Delete client
 */
export async function deleteClient(clientId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    throw new Error(`Failed to delete client: ${error.message}`);
  }
}

