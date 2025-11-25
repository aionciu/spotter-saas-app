import type { Tables } from "@/lib/supabase/types";

/**
 * User type from database
 */
export type User = Tables<"users">;

/**
 * User subscription plan
 */
export type SubscriptionPlan = "free" | "pro" | "ultra";

/**
 * User subscription status
 */
export type SubscriptionStatus = "active" | "past_due" | "canceled";

/**
 * User with subscription information
 */
export interface UserWithSubscription extends User {
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
}

/**
 * User profile (public-facing user data)
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
}

