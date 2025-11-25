import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  enforceClientLimit,
  enforcePackageLimit,
  enforceWorkoutLimit,
  enforceExerciseLimit,
} from "@/lib/subscriptions/enforce-limits";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getClientById } from "@/lib/db/queries/clients";
import { getUserSubscription } from "@/lib/subscriptions/utils";
import {
  countClientsForTrainer,
  countPackagesForClient,
  countWorkoutsForClient,
  countExercisesForWorkout,
} from "@/lib/subscriptions/usage";

// Mock all dependencies
vi.mock("@/lib/clerk");
vi.mock("@/lib/db/queries/users");
vi.mock("@/lib/db/queries/clients");
vi.mock("@/lib/subscriptions/utils");
vi.mock("@/lib/subscriptions/usage");
vi.mock("@/lib/db/queries/workouts");

describe("Subscription Limit Enforcement", () => {
  const mockUser = {
    id: "user-123",
    clerk_user_id: "clerk-123",
    email: "test@example.com",
    subscription_plan: "free" as const,
    subscription_status: "active" as const,
  };

  const mockSubscription = {
    plan: "free" as const,
    status: "active" as const,
    limits: {
      maxClients: 5,
      maxPackagesPerClient: 3,
      maxWorkoutsPerClient: 10,
      maxExercisesPerWorkout: 15,
      features: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(getUserSubscription).mockResolvedValue(mockSubscription);
  });

  describe("enforceClientLimit", () => {
    it("should allow creation when within limit", async () => {
      vi.mocked(countClientsForTrainer).mockResolvedValue(3);

      await expect(enforceClientLimit()).resolves.not.toThrow();
      expect(countClientsForTrainer).toHaveBeenCalledWith("user-123");
    });

    it("should throw error when limit exceeded", async () => {
      vi.mocked(countClientsForTrainer).mockResolvedValue(5); // At limit

      await expect(enforceClientLimit()).rejects.toThrow("limit");
    });

    it("should throw error when not authenticated", async () => {
      vi.mocked(getCurrentUserId).mockResolvedValue(null);

      await expect(enforceClientLimit()).rejects.toThrow(
        "Authentication required"
      );
    });

    it("should throw error when subscription is inactive", async () => {
      vi.mocked(getUserSubscription).mockResolvedValue({
        ...mockSubscription,
        status: "past_due",
      });
      vi.mocked(countClientsForTrainer).mockResolvedValue(2);

      await expect(enforceClientLimit()).rejects.toThrow(
        "subscription is not active"
      );
    });

    it("should throw error when subscription fetch fails", async () => {
      vi.mocked(getUserSubscription).mockResolvedValue(null);

      await expect(enforceClientLimit()).rejects.toThrow(
        "Failed to get subscription"
      );
    });
  });

  describe("enforcePackageLimit", () => {
    const mockClient = {
      id: "client-123",
      trainer_id: "user-123",
      name: "Test Client",
    };

    beforeEach(() => {
      vi.mocked(getClientById).mockResolvedValue(mockClient);
    });

    it("should allow creation when within limit", async () => {
      vi.mocked(countPackagesForClient).mockResolvedValue(2);

      await expect(
        enforcePackageLimit("client-123")
      ).resolves.not.toThrow();
      expect(countPackagesForClient).toHaveBeenCalledWith("client-123");
    });

    it("should throw error when limit exceeded", async () => {
      vi.mocked(countPackagesForClient).mockResolvedValue(3); // At limit

      await expect(enforcePackageLimit("client-123")).rejects.toThrow(
        "limit"
      );
    });

    it("should throw error when client does not belong to user", async () => {
      vi.mocked(getClientById).mockResolvedValue({
        ...mockClient,
        trainer_id: "other-user",
      });
      vi.mocked(countPackagesForClient).mockResolvedValue(1);

      await expect(enforcePackageLimit("client-123")).rejects.toThrow(
        "does not belong to you"
      );
    });

    it("should throw error when subscription is inactive", async () => {
      vi.mocked(getUserSubscription).mockResolvedValue({
        ...mockSubscription,
        status: "canceled",
      });
      vi.mocked(countPackagesForClient).mockResolvedValue(1);

      await expect(enforcePackageLimit("client-123")).rejects.toThrow(
        "subscription is not active"
      );
    });
  });

  describe("enforceWorkoutLimit", () => {
    const mockClient = {
      id: "client-123",
      trainer_id: "user-123",
      name: "Test Client",
    };

    beforeEach(() => {
      vi.mocked(getClientById).mockResolvedValue(mockClient);
    });

    it("should allow creation when within limit", async () => {
      vi.mocked(countWorkoutsForClient).mockResolvedValue(5);

      await expect(
        enforceWorkoutLimit("client-123")
      ).resolves.not.toThrow();
      expect(countWorkoutsForClient).toHaveBeenCalledWith("client-123");
    });

    it("should throw error when limit exceeded", async () => {
      vi.mocked(countWorkoutsForClient).mockResolvedValue(10); // At limit

      await expect(enforceWorkoutLimit("client-123")).rejects.toThrow(
        "limit"
      );
    });

    it("should throw error when client does not belong to user", async () => {
      vi.mocked(getClientById).mockResolvedValue({
        ...mockClient,
        trainer_id: "other-user",
      });
      vi.mocked(countWorkoutsForClient).mockResolvedValue(5);

      await expect(enforceWorkoutLimit("client-123")).rejects.toThrow(
        "does not belong to you"
      );
    });
  });

  describe("enforceExerciseLimit", () => {
    const mockClient = {
      id: "client-123",
      trainer_id: "user-123",
      name: "Test Client",
    };

    const mockWorkout = {
      id: "workout-123",
      client_id: "client-123",
      name: "Test Workout",
      exercises: [],
    };

    beforeEach(() => {
      vi.mocked(getClientById).mockResolvedValue(mockClient);
    });

    it("should allow creation when within limit", async () => {
      const { getWorkoutById } = await import("@/lib/db/queries/workouts");
      vi.mocked(getWorkoutById).mockResolvedValue(mockWorkout);
      vi.mocked(countExercisesForWorkout).mockResolvedValue(10);

      await expect(
        enforceExerciseLimit("workout-123")
      ).resolves.not.toThrow();
      expect(countExercisesForWorkout).toHaveBeenCalledWith("workout-123");
    });

    it("should throw error when limit exceeded", async () => {
      const { getWorkoutById } = await import("@/lib/db/queries/workouts");
      vi.mocked(getWorkoutById).mockResolvedValue(mockWorkout);
      vi.mocked(countExercisesForWorkout).mockResolvedValue(15); // At limit

      await expect(enforceExerciseLimit("workout-123")).rejects.toThrow(
        "limit"
      );
    });

    it("should throw error when workout does not belong to user", async () => {
      const { getWorkoutById } = await import("@/lib/db/queries/workouts");
      vi.mocked(getWorkoutById).mockResolvedValue({
        ...mockWorkout,
        client_id: "other-client",
      });
      vi.mocked(getClientById).mockResolvedValue({
        ...mockClient,
        id: "other-client",
        trainer_id: "other-user",
      });
      vi.mocked(countExercisesForWorkout).mockResolvedValue(5);

      await expect(enforceExerciseLimit("workout-123")).rejects.toThrow(
        "does not belong to you"
      );
    });
  });
});

