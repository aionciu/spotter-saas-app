import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/user";
import { getSubscriptionByUserId } from "@/lib/db/queries/subscriptions";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getPlanLimits } from "./plans";

/**
 * Get user's subscription plan and status
 */
export async function getUserSubscription(clerkUserId: string): Promise<{
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  limits: ReturnType<typeof getPlanLimits>;
} | null> {
  try {
    const user = await getUserByClerkId(clerkUserId);
    const subscription = await getSubscriptionByUserId(user.id);

    // Use subscription table if available, otherwise fall back to user table
    const plan = (subscription?.plan_type ||
      user.subscription_plan ||
      "free") as SubscriptionPlan;
    const status = (subscription?.status ||
      user.subscription_status ||
      "active") as SubscriptionStatus;

    return {
      plan,
      status,
      limits: getPlanLimits(plan),
    };
  } catch {
    // If user doesn't exist, return default free plan
    return {
      plan: "free",
      status: "active",
      limits: getPlanLimits("free"),
    };
  }
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  clerkUserId: string,
  feature: keyof ReturnType<typeof getPlanLimits>["features"]
): Promise<boolean> {
  const subscription = await getUserSubscription(clerkUserId);
  if (!subscription) {
    return false;
  }

  return subscription.limits.features[feature];
}

/**
 * Format subscription plan name for display
 */
export function formatPlanName(plan: SubscriptionPlan): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

/**
 * Get subscription plan price (for display purposes)
 * Note: Actual pricing will be handled by Stripe
 */
export function getPlanPrice(plan: SubscriptionPlan): string {
  const prices: Record<SubscriptionPlan, string> = {
    free: "Free",
    pro: "$29/month",
    ultra: "$99/month",
  };
  return prices[plan];
}

/**
 * Check if plan allows unlimited resources
 */
export function isUnlimited(plan: SubscriptionPlan): boolean {
  return plan === "ultra";
}

