import { describe, it, expect } from "vitest";
import {
  checkClientLimit,
  checkPackageLimit,
  checkWorkoutLimit,
  checkExerciseLimit,
  isSubscriptionActive,
  canPerformAction,
  getUpgradeRecommendation,
} from "@/lib/subscriptions/enforcement";

describe("Subscription Enforcement", () => {
  describe("checkClientLimit", () => {
    it("should allow when within limit", () => {
      const result = checkClientLimit("free", 3);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.current).toBe(3);
      expect(result.remaining).toBe(2);
    });

    it("should disallow when at limit", () => {
      const result = checkClientLimit("free", 5);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.message).toContain("limit");
    });

    it("should allow unlimited for ultra plan", () => {
      const result = checkClientLimit("ultra", 1000);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(-1);
      expect(result.remaining).toBe(-1);
    });
  });

  describe("checkPackageLimit", () => {
    it("should check package limits correctly", () => {
      const result = checkPackageLimit("free", 2);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(3);
    });

    it("should disallow when exceeding limit", () => {
      const result = checkPackageLimit("free", 4);
      expect(result.allowed).toBe(false);
    });
  });

  describe("checkWorkoutLimit", () => {
    it("should check workout limits correctly", () => {
      const result = checkWorkoutLimit("free", 5);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
    });

    it("should disallow when exceeding limit", () => {
      const result = checkWorkoutLimit("free", 11);
      expect(result.allowed).toBe(false);
    });
  });

  describe("checkExerciseLimit", () => {
    it("should check exercise limits correctly", () => {
      const result = checkExerciseLimit("free", 10);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(15);
    });

    it("should disallow when exceeding limit", () => {
      const result = checkExerciseLimit("free", 16);
      expect(result.allowed).toBe(false);
    });
  });

  describe("isSubscriptionActive", () => {
    it("should return true for active status", () => {
      expect(isSubscriptionActive("active")).toBe(true);
    });

    it("should return false for non-active status", () => {
      expect(isSubscriptionActive("past_due")).toBe(false);
      expect(isSubscriptionActive("canceled")).toBe(false);
    });
  });

  describe("canPerformAction", () => {
    it("should allow action for active subscription", () => {
      expect(canPerformAction("free", "active")).toBe(true);
      expect(canPerformAction("pro", "active")).toBe(true);
    });

    it("should disallow action for inactive subscription", () => {
      expect(canPerformAction("free", "past_due")).toBe(false);
      expect(canPerformAction("pro", "canceled")).toBe(false);
    });
  });

  describe("getUpgradeRecommendation", () => {
    it("should recommend pro when free plan hits limits", () => {
      const recommendation = getUpgradeRecommendation("free", {
        clientCount: 6, // Exceeds free limit of 5
        packageCount: 2,
        workoutCount: 5,
      });
      expect(recommendation).toBe("pro");
    });

    it("should recommend ultra when pro plan hits limits", () => {
      const recommendation = getUpgradeRecommendation("pro", {
        clientCount: 51, // Exceeds pro limit of 50
        packageCount: 5,
        workoutCount: 10,
      });
      expect(recommendation).toBe("ultra");
    });

    it("should return null when within limits", () => {
      const recommendation = getUpgradeRecommendation("free", {
        clientCount: 3,
        packageCount: 2,
        workoutCount: 5,
      });
      expect(recommendation).toBe(null);
    });

    it("should return null for ultra plan", () => {
      const recommendation = getUpgradeRecommendation("ultra", {
        clientCount: 1000,
        packageCount: 100,
        workoutCount: 500,
      });
      expect(recommendation).toBe(null);
    });
  });
});

