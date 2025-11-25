import type { SubscriptionPlan } from "@/lib/types/user";

/**
 * Subscription plan limits
 */
export interface PlanLimits {
  maxClients: number;
  maxPackagesPerClient: number;
  maxWorkoutsPerClient: number;
  maxExercisesPerWorkout: number;
  features: {
    aiWorkoutGeneration: boolean;
    advancedAnalytics: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
}

/**
 * Subscription plan definitions
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxClients: 5,
    maxPackagesPerClient: 3,
    maxWorkoutsPerClient: 10,
    maxExercisesPerWorkout: 15,
    features: {
      aiWorkoutGeneration: false,
      advancedAnalytics: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  pro: {
    maxClients: 50,
    maxPackagesPerClient: 10,
    maxWorkoutsPerClient: 100,
    maxExercisesPerWorkout: 20,
    features: {
      aiWorkoutGeneration: true,
      advancedAnalytics: true,
      customBranding: false,
      apiAccess: false,
      prioritySupport: true,
    },
  },
  ultra: {
    maxClients: -1, // Unlimited
    maxPackagesPerClient: -1, // Unlimited
    maxWorkoutsPerClient: -1, // Unlimited
    maxExercisesPerWorkout: -1, // Unlimited
    features: {
      aiWorkoutGeneration: true,
      advancedAnalytics: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
};

/**
 * Get limits for a subscription plan
 */
export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return SUBSCRIPTION_PLANS[plan];
}

/**
 * Check if a plan has a specific feature
 */
export function hasFeature(
  plan: SubscriptionPlan,
  feature: keyof PlanLimits["features"]
): boolean {
  return SUBSCRIPTION_PLANS[plan].features[feature];
}

/**
 * Check if a value is within plan limits
 * Returns true if limit is -1 (unlimited) or value is less than or equal to limit
 */
export function isWithinLimit(
  plan: SubscriptionPlan,
  limitType: keyof Omit<PlanLimits, "features">,
  currentValue: number
): boolean {
  const limits = getPlanLimits(plan);
  const limit = limits[limitType];

  // -1 means unlimited
  if (limit === -1) {
    return true;
  }

  return currentValue < limit;
}

/**
 * Get the remaining capacity for a limit
 * Returns -1 if unlimited, otherwise returns remaining capacity
 */
export function getRemainingCapacity(
  plan: SubscriptionPlan,
  limitType: keyof Omit<PlanLimits, "features">,
  currentValue: number
): number {
  const limits = getPlanLimits(plan);
  const limit = limits[limitType];

  // -1 means unlimited
  if (limit === -1) {
    return -1;
  }

  return Math.max(0, limit - currentValue);
}

