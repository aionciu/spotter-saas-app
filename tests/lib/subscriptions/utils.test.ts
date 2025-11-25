import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUserSubscription,
  formatPlanName,
  getPlanPrice,
  isUnlimited,
} from "@/lib/subscriptions/utils";
import * as utilsModule from "@/lib/subscriptions/utils";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getSubscriptionByUserId } from "@/lib/db/queries/subscriptions";
import { getPlanLimits } from "@/lib/subscriptions/plans";

// Mock dependencies
vi.mock("@/lib/db/queries/users");
vi.mock("@/lib/db/queries/subscriptions");
vi.mock("@/lib/subscriptions/plans");

describe("Subscription Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserSubscription", () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
      subscription_plan: "pro" as const,
      subscription_status: "active" as const,
    };

    const mockSubscription = {
      id: "sub-123",
      user_id: "user-123",
      plan_type: "pro" as const,
      status: "active" as const,
    };

    it("should return subscription from subscription table", async () => {
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
      vi.mocked(getSubscriptionByUserId).mockResolvedValue(mockSubscription);
      vi.mocked(getPlanLimits).mockReturnValue({
        maxClients: 50,
        maxPackagesPerClient: 10,
        maxWorkoutsPerClient: 100,
        maxExercisesPerWorkout: 20,
        features: {},
      });

      const result = await getUserSubscription("clerk-123");

      expect(result).toEqual({
        plan: "pro",
        status: "active",
        limits: expect.any(Object),
      });
      expect(getPlanLimits).toHaveBeenCalledWith("pro");
    });

    it("should fall back to user table when subscription table is empty", async () => {
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
      vi.mocked(getSubscriptionByUserId).mockResolvedValue(null);
      vi.mocked(getPlanLimits).mockReturnValue({
        maxClients: 50,
        maxPackagesPerClient: 10,
        maxWorkoutsPerClient: 100,
        maxExercisesPerWorkout: 20,
        features: {},
      });

      const result = await getUserSubscription("clerk-123");

      expect(result?.plan).toBe("pro");
      expect(result?.status).toBe("active");
    });

    it("should return default free plan when user does not exist", async () => {
      vi.mocked(getUserByClerkId).mockRejectedValue(
        new Error("User not found")
      );
      vi.mocked(getPlanLimits).mockReturnValue({
        maxClients: 5,
        maxPackagesPerClient: 3,
        maxWorkoutsPerClient: 10,
        maxExercisesPerWorkout: 15,
        features: {},
      });

      const result = await getUserSubscription("clerk-123");

      expect(result).toEqual({
        plan: "free",
        status: "active",
        limits: expect.any(Object),
      });
    });
  });

  describe("hasFeatureAccess", () => {
    it("should return true when user has feature access", async () => {
      const mockUser = {
        id: "user-123",
        clerk_user_id: "clerk-123",
        email: "test@example.com",
        subscription_plan: "pro" as const,
        subscription_status: "active" as const,
      };

      const mockSubscription = {
        id: "sub-123",
        user_id: "user-123",
        plan_type: "pro" as const,
        status: "active" as const,
      };

      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
      vi.mocked(getSubscriptionByUserId).mockResolvedValue(mockSubscription);
      vi.mocked(getPlanLimits).mockReturnValue({
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
      });

      const hasAccess = await utilsModule.hasFeatureAccess(
        "clerk-123",
        "aiWorkoutGeneration"
      );

      expect(hasAccess).toBe(true);
    });

    it("should return false when user does not have feature access", async () => {
      const mockUser = {
        id: "user-123",
        clerk_user_id: "clerk-123",
        email: "test@example.com",
        subscription_plan: "free" as const,
        subscription_status: "active" as const,
      };

      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
      vi.mocked(getSubscriptionByUserId).mockResolvedValue(null);
      vi.mocked(getPlanLimits).mockReturnValue({
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
      });

      const hasAccess = await utilsModule.hasFeatureAccess(
        "clerk-123",
        "aiWorkoutGeneration"
      );

      expect(hasAccess).toBe(false);
    });

    it("should return false when subscription is null", async () => {
      vi.mocked(getUserByClerkId).mockRejectedValue(
        new Error("User not found")
      );
      vi.mocked(getPlanLimits).mockReturnValue({
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
      });

      const hasAccess = await utilsModule.hasFeatureAccess(
        "clerk-123",
        "aiWorkoutGeneration"
      );

      expect(hasAccess).toBe(false);
    });
  });

  describe("formatPlanName", () => {
    it("should capitalize plan name", () => {
      expect(formatPlanName("free")).toBe("Free");
      expect(formatPlanName("pro")).toBe("Pro");
      expect(formatPlanName("ultra")).toBe("Ultra");
    });
  });

  describe("getPlanPrice", () => {
    it("should return correct prices", () => {
      expect(getPlanPrice("free")).toBe("Free");
      expect(getPlanPrice("pro")).toBe("$29/month");
      expect(getPlanPrice("ultra")).toBe("$99/month");
    });
  });

  describe("isUnlimited", () => {
    it("should return true for ultra plan", () => {
      expect(isUnlimited("ultra")).toBe(true);
    });

    it("should return false for other plans", () => {
      expect(isUnlimited("free")).toBe(false);
      expect(isUnlimited("pro")).toBe(false);
    });
  });
});

