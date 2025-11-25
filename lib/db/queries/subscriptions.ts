import { createServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type Subscription = Tables<"subscriptions">;
export type SubscriptionInsert = TablesInsert<"subscriptions">;
export type SubscriptionUpdate = TablesUpdate<"subscriptions">;

/**
 * Get subscription for a user
 */
export async function getSubscriptionByUserId(userId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    // Subscription might not exist yet
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get subscription: ${error.message}`);
  }

  return data;
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  subscriptionData: SubscriptionInsert
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(subscriptionData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }

  return data;
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: SubscriptionUpdate
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  return data;
}

/**
 * Update subscription by user ID
 */
export async function updateSubscriptionByUserId(
  userId: string,
  updates: SubscriptionUpdate
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  return data;
}

