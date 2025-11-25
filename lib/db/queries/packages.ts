import { createServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type Package = Tables<"packages">;
export type PackageInsert = TablesInsert<"packages">;
export type PackageUpdate = TablesUpdate<"packages">;

/**
 * Get all packages for a client
 */
export async function getPackagesByClientId(clientId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get packages: ${error.message}`);
  }

  return data;
}

/**
 * Get active packages for a client
 */
export async function getActivePackagesByClientId(clientId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .gt("remaining_sessions", 0)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get active packages: ${error.message}`);
  }

  return data;
}

/**
 * Get package by ID
 */
export async function getPackageById(packageId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("id", packageId)
    .single();

  if (error) {
    throw new Error(`Failed to get package: ${error.message}`);
  }

  return data;
}

/**
 * Create a new package
 */
export async function createPackage(packageData: PackageInsert) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("packages")
    .insert(packageData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create package: ${error.message}`);
  }

  return data;
}

/**
 * Update package
 */
export async function updatePackage(
  packageId: string,
  updates: PackageUpdate
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("packages")
    .update(updates)
    .eq("id", packageId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update package: ${error.message}`);
  }

  return data;
}

/**
 * Deduct a session from a package
 */
export async function deductSessionFromPackage(packageId: string) {
  const packageData = await getPackageById(packageId);

  if (packageData.remaining_sessions <= 0) {
    throw new Error("No remaining sessions in package");
  }

  return await updatePackage(packageId, {
    remaining_sessions: packageData.remaining_sessions - 1,
  });
}

