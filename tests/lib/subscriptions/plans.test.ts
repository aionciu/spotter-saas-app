import { describe, it, expect } from "vitest";
import {
  SUBSCRIPTION_PLANS,
  getPlanLimits,
  hasFeature,
  isWithinLimit,
  getRemainingCapacity,
} from "@/lib/subscriptions/plans";

describe("Subscription Plans", () => {
  describe("SUBSCRIPTION_PLANS", () => {
    it("should define all three plans", () => {
      expect(SUBSCRIPTION_PLANS.free).toBeDefined();
      expect(SUBSCRIPTION_PLANS.pro).toBeDefined();
      expect(SUBSCRIPTION_PLANS.ultra).toBeDefined();
    });

    it("should have correct free plan limits", () => {
      const free = SUBSCRIPTION_PLANS.free;
      expect(free.maxClients).toBe(5);
      expect(free.maxPackagesPerClient).toBe(3);
      expect(free.maxWorkoutsPerClient).toBe(10);
      expect(free.maxExercisesPerWorkout).toBe(15);
      expect(free.features.aiWorkoutGeneration).toBe(false);
    });

    it("should have correct pro plan limits", () => {
      const pro = SUBSCRIPTION_PLANS.pro;
      expect(pro.maxClients).toBe(50);
      expect(pro.maxPackagesPerClient).toBe(10);
      expect(pro.features.aiWorkoutGeneration).toBe(true);
      expect(pro.features.advancedAnalytics).toBe(true);
    });

    it("should have unlimited ultra plan", () => {
      const ultra = SUBSCRIPTION_PLANS.ultra;
      expect(ultra.maxClients).toBe(-1);
      expect(ultra.maxPackagesPerClient).toBe(-1);
      expect(ultra.maxWorkoutsPerClient).toBe(-1);
      expect(ultra.maxExercisesPerWorkout).toBe(-1);
      expect(ultra.features.aiWorkoutGeneration).toBe(true);
      expect(ultra.features.customBranding).toBe(true);
    });
  });

  describe("getPlanLimits", () => {
    it("should return correct limits for free plan", () => {
      const limits = getPlanLimits("free");
      expect(limits.maxClients).toBe(5);
    });

    it("should return correct limits for pro plan", () => {
      const limits = getPlanLimits("pro");
      expect(limits.maxClients).toBe(50);
    });

    it("should return correct limits for ultra plan", () => {
      const limits = getPlanLimits("ultra");
      expect(limits.maxClients).toBe(-1);
    });
  });

  describe("hasFeature", () => {
    it("should return false for free plan features", () => {
      expect(hasFeature("free", "aiWorkoutGeneration")).toBe(false);
      expect(hasFeature("free", "advancedAnalytics")).toBe(false);
    });

    it("should return true for pro plan features", () => {
      expect(hasFeature("pro", "aiWorkoutGeneration")).toBe(true);
      expect(hasFeature("pro", "advancedAnalytics")).toBe(true);
    });

    it("should return true for ultra plan features", () => {
      expect(hasFeature("ultra", "aiWorkoutGeneration")).toBe(true);
      expect(hasFeature("ultra", "customBranding")).toBe(true);
      expect(hasFeature("ultra", "apiAccess")).toBe(true);
    });
  });

  describe("isWithinLimit", () => {
    it("should return true when within limit", () => {
      expect(isWithinLimit("free", "maxClients", 3)).toBe(true);
      expect(isWithinLimit("free", "maxClients", 5)).toBe(false); // At limit
    });

    it("should return true for unlimited plans", () => {
      expect(isWithinLimit("ultra", "maxClients", 1000)).toBe(true);
      expect(isWithinLimit("ultra", "maxClients", 0)).toBe(true);
    });

    it("should return false when exceeding limit", () => {
      expect(isWithinLimit("free", "maxClients", 6)).toBe(false);
      expect(isWithinLimit("pro", "maxClients", 51)).toBe(false);
    });
  });

  describe("getRemainingCapacity", () => {
    it("should return correct remaining capacity", () => {
      expect(getRemainingCapacity("free", "maxClients", 3)).toBe(2);
      expect(getRemainingCapacity("free", "maxClients", 5)).toBe(0);
    });

    it("should return -1 for unlimited plans", () => {
      expect(getRemainingCapacity("ultra", "maxClients", 1000)).toBe(-1);
      expect(getRemainingCapacity("ultra", "maxClients", 0)).toBe(-1);
    });

    it("should return 0 when at or over limit", () => {
      expect(getRemainingCapacity("free", "maxClients", 5)).toBe(0);
      expect(getRemainingCapacity("free", "maxClients", 10)).toBe(0);
    });
  });
});

