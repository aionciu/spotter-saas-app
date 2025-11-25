import { createServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type User = Tables<"users">;
export type UserInsert = TablesInsert<"users">;
export type UserUpdate = TablesUpdate<"users">;

/**
 * Get user by Clerk user ID
 */
export async function getUserByClerkId(clerkUserId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error) {
    // Provide more detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
    throw new Error(
      `Failed to get user: ${error.message} (Code: ${error.code || "unknown"})`
    );
  }

  return data;
}

/**
 * Get user by database ID
 */
export async function getUserById(userId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return data;
}

/**
 * Create a new user
 */
export async function createUser(userData: UserInsert) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("users")
    .insert(userData)
    .select()
    .single();

  if (error) {
    // Provide more detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
    throw new Error(
      `Failed to create user: ${error.message} (Code: ${error.code || "unknown"})`
    );
  }

  return data;
}

/**
 * Update user
 */
export async function updateUser(userId: string, updates: UserUpdate) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return data;
}

/**
 * Get or create user by Clerk ID
 * Useful for syncing Clerk users with database
 */
export async function getOrCreateUserByClerkId(
  clerkUserId: string,
  email: string,
  name?: string
) {
  try {
    return await getUserByClerkId(clerkUserId);
  } catch {
    // User doesn't exist, create it
    return await createUser({
      clerk_user_id: clerkUserId,
      email,
      name: name ?? null,
    });
  }
}

