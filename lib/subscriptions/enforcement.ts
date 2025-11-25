import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/user";
import { getPlanLimits, isWithinLimit } from "./plans";

/**
 * Limit check result
 */
export interface LimitCheckResult {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
  message?: string;
}

/**
 * Check if user can add more clients
 */
export function checkClientLimit(
  plan: SubscriptionPlan,
  currentClientCount: number
): LimitCheckResult {
  const limits = getPlanLimits(plan);
  const limit = limits.maxClients;
  const allowed = isWithinLimit(plan, "maxClients", currentClientCount);

  return {
    allowed,
    limit,
    current: currentClientCount,
    remaining: limit === -1 ? -1 : Math.max(0, limit - currentClientCount),
    message: allowed
      ? undefined
      : `You've reached the limit of ${limit} clients for your ${plan} plan.`,
  };
}

/**
 * Check if user can add more packages for a client
 */
export function checkPackageLimit(
  plan: SubscriptionPlan,
  currentPackageCount: number
): LimitCheckResult {
  const limits = getPlanLimits(plan);
  const limit = limits.maxPackagesPerClient;
  const allowed = isWithinLimit(plan, "maxPackagesPerClient", currentPackageCount);

  return {
    allowed,
    limit,
    current: currentPackageCount,
    remaining: limit === -1 ? -1 : Math.max(0, limit - currentPackageCount),
    message: allowed
      ? undefined
      : `You've reached the limit of ${limit} packages per client for your ${plan} plan.`,
  };
}

/**
 * Check if user can add more workouts for a client
 */
export function checkWorkoutLimit(
  plan: SubscriptionPlan,
  currentWorkoutCount: number
): LimitCheckResult {
  const limits = getPlanLimits(plan);
  const limit = limits.maxWorkoutsPerClient;
  const allowed = isWithinLimit(plan, "maxWorkoutsPerClient", currentWorkoutCount);

  return {
    allowed,
    limit,
    current: currentWorkoutCount,
    remaining: limit === -1 ? -1 : Math.max(0, limit - currentWorkoutCount),
    message: allowed
      ? undefined
      : `You've reached the limit of ${limit} workouts per client for your ${plan} plan.`,
  };
}

/**
 * Check if user can add more exercises to a workout
 */
export function checkExerciseLimit(
  plan: SubscriptionPlan,
  currentExerciseCount: number
): LimitCheckResult {
  const limits = getPlanLimits(plan);
  const limit = limits.maxExercisesPerWorkout;
  const allowed = isWithinLimit(plan, "maxExercisesPerWorkout", currentExerciseCount);

  return {
    allowed,
    limit,
    current: currentExerciseCount,
    remaining: limit === -1 ? -1 : Math.max(0, limit - currentExerciseCount),
    message: allowed
      ? undefined
      : `You've reached the limit of ${limit} exercises per workout for your ${plan} plan.`,
  };
}

/**
 * Check if subscription is active and can use features
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === "active";
}

/**
 * Check if user can perform an action based on subscription
 */
export function canPerformAction(
  plan: SubscriptionPlan,
  status: SubscriptionStatus
): boolean {
  return isSubscriptionActive(status);
}

/**
 * Get upgrade recommendation based on current usage
 */
export function getUpgradeRecommendation(
  currentPlan: SubscriptionPlan,
  usage: {
    clientCount: number;
    packageCount: number;
    workoutCount: number;
  }
): SubscriptionPlan | null {
  // Check if user is hitting limits
  const clientCheck = checkClientLimit(currentPlan, usage.clientCount);
  const packageCheck = checkPackageLimit(currentPlan, usage.packageCount);
  const workoutCheck = checkWorkoutLimit(currentPlan, usage.workoutCount);

  // If hitting any limits and not on ultra, recommend next tier
  if (
    (!clientCheck.allowed || !packageCheck.allowed || !workoutCheck.allowed) &&
    currentPlan !== "ultra"
  ) {
    if (currentPlan === "free") {
      return "pro";
    }
    if (currentPlan === "pro") {
      return "ultra";
    }
  }

  return null;
}

