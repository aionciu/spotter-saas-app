"use client";

import { useCallback } from "react";
import { useSubscription as useSubscriptionContext } from "@/contexts/SubscriptionContext";
import {
  checkClientLimit,
  checkPackageLimit,
  checkWorkoutLimit,
  checkExerciseLimit,
  canPerformAction,
} from "@/lib/subscriptions/enforcement";
import { hasFeature as hasFeatureUtil } from "@/lib/subscriptions/plans";
import type { LimitCheckResult } from "@/lib/subscriptions/enforcement";

/**
 * Hook for subscription management and limit checking
 * 
 * This hook extends the base useSubscription hook with
 * convenient methods for checking limits and features.
 */
export function useSubscriptionLimits() {
  const { plan, status, limits, isLoading } = useSubscriptionContext();

  const checkClientLimitForPlan = useCallback(
    (currentCount: number): LimitCheckResult => {
      return checkClientLimit(plan, currentCount);
    },
    [plan]
  );

  const checkPackageLimitForPlan = useCallback(
    (currentCount: number): LimitCheckResult => {
      return checkPackageLimit(plan, currentCount);
    },
    [plan]
  );

  const checkWorkoutLimitForPlan = useCallback(
    (currentCount: number): LimitCheckResult => {
      return checkWorkoutLimit(plan, currentCount);
    },
    [plan]
  );

  const checkExerciseLimitForPlan = useCallback(
    (currentCount: number): LimitCheckResult => {
      return checkExerciseLimit(plan, currentCount);
    },
    [plan]
  );

  const hasFeature = useCallback(
    (feature: keyof typeof limits.features): boolean => {
      return hasFeatureUtil(plan, feature);
    },
    [plan, limits.features]
  );

  const canPerform = useCallback((): boolean => {
    return canPerformAction(plan, status);
  }, [plan, status]);

  return {
    plan,
    status,
    limits,
    isLoading,
    checkClientLimit: checkClientLimitForPlan,
    checkPackageLimit: checkPackageLimitForPlan,
    checkWorkoutLimit: checkWorkoutLimitForPlan,
    checkExerciseLimit: checkExerciseLimitForPlan,
    hasFeature,
    canPerform,
  };
}

// Re-export the base hook
export { useSubscription } from "@/contexts/SubscriptionContext";

