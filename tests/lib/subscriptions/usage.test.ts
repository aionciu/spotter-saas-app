import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  countClientsForTrainer,
  countPackagesForClient,
  countWorkoutsForClient,
  countExercisesForWorkout,
} from "@/lib/subscriptions/usage";
import { getClientsByTrainerId } from "@/lib/db/queries/clients";
import { getPackagesByClientId } from "@/lib/db/queries/packages";
import { getWorkoutsByClientId } from "@/lib/db/queries/workouts";
import { createServerClient } from "@/lib/supabase/server";

// Mock database query functions
vi.mock("@/lib/db/queries/clients");
vi.mock("@/lib/db/queries/packages");
vi.mock("@/lib/db/queries/workouts");
vi.mock("@/lib/supabase/server");

describe("Subscription Usage Counting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("countClientsForTrainer", () => {
    it("should return correct count of clients", async () => {
      const mockClients = [
        { id: "client-1", trainer_id: "trainer-1", name: "Client 1" },
        { id: "client-2", trainer_id: "trainer-1", name: "Client 2" },
        { id: "client-3", trainer_id: "trainer-1", name: "Client 3" },
      ];

      vi.mocked(getClientsByTrainerId).mockResolvedValue(mockClients);

      const count = await countClientsForTrainer("trainer-1");

      expect(count).toBe(3);
      expect(getClientsByTrainerId).toHaveBeenCalledWith("trainer-1");
    });

    it("should return 0 when no clients exist", async () => {
      vi.mocked(getClientsByTrainerId).mockResolvedValue([]);

      const count = await countClientsForTrainer("trainer-1");

      expect(count).toBe(0);
    });

    it("should return 0 on error", async () => {
      vi.mocked(getClientsByTrainerId).mockRejectedValue(
        new Error("Database error")
      );

      const count = await countClientsForTrainer("trainer-1");

      expect(count).toBe(0);
    });
  });

  describe("countPackagesForClient", () => {
    it("should return correct count of packages", async () => {
      const mockPackages = [
        { id: "pkg-1", client_id: "client-1", total_sessions: 10 },
        { id: "pkg-2", client_id: "client-1", total_sessions: 20 },
      ];

      vi.mocked(getPackagesByClientId).mockResolvedValue(mockPackages);

      const count = await countPackagesForClient("client-1");

      expect(count).toBe(2);
      expect(getPackagesByClientId).toHaveBeenCalledWith("client-1");
    });

    it("should return 0 when no packages exist", async () => {
      vi.mocked(getPackagesByClientId).mockResolvedValue([]);

      const count = await countPackagesForClient("client-1");

      expect(count).toBe(0);
    });

    it("should return 0 on error", async () => {
      vi.mocked(getPackagesByClientId).mockRejectedValue(
        new Error("Database error")
      );

      const count = await countPackagesForClient("client-1");

      expect(count).toBe(0);
    });
  });

  describe("countWorkoutsForClient", () => {
    it("should return correct count of workouts", async () => {
      const mockWorkouts = [
        { id: "workout-1", client_id: "client-1", name: "Workout 1" },
        { id: "workout-2", client_id: "client-1", name: "Workout 2" },
        { id: "workout-3", client_id: "client-1", name: "Workout 3" },
        { id: "workout-4", client_id: "client-1", name: "Workout 4" },
      ];

      vi.mocked(getWorkoutsByClientId).mockResolvedValue(mockWorkouts);

      const count = await countWorkoutsForClient("client-1");

      expect(count).toBe(4);
      expect(getWorkoutsByClientId).toHaveBeenCalledWith("client-1");
    });

    it("should return 0 when no workouts exist", async () => {
      vi.mocked(getWorkoutsByClientId).mockResolvedValue([]);

      const count = await countWorkoutsForClient("client-1");

      expect(count).toBe(0);
    });

    it("should return 0 on error", async () => {
      vi.mocked(getWorkoutsByClientId).mockRejectedValue(
        new Error("Database error")
      );

      const count = await countWorkoutsForClient("client-1");

      expect(count).toBe(0);
    });
  });

  describe("countExercisesForWorkout", () => {
    it("should return correct count of exercises", async () => {
      const mockSupabase = {
        from: vi.fn(() => mockSupabase),
        select: vi.fn(() => mockSupabase),
        eq: vi.fn().mockResolvedValue({
          count: 5,
          error: null,
        }),
      };

      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

      const count = await countExercisesForWorkout("workout-1");

      expect(count).toBe(5);
      expect(mockSupabase.from).toHaveBeenCalledWith("exercises");
      expect(mockSupabase.select).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith("workout_id", "workout-1");
    });

    it("should return 0 when count is null", async () => {
      const mockSupabase = {
        from: vi.fn(() => mockSupabase),
        select: vi.fn(() => mockSupabase),
        eq: vi.fn().mockResolvedValue({
          count: null,
          error: null,
        }),
      };

      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

      const count = await countExercisesForWorkout("workout-1");

      expect(count).toBe(0);
    });

    it("should return 0 on error", async () => {
      const mockSupabase = {
        from: vi.fn(() => mockSupabase),
        select: vi.fn(() => mockSupabase),
        eq: vi.fn().mockResolvedValue({
          count: null,
          error: { message: "Query failed" },
        }),
      };

      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

      const count = await countExercisesForWorkout("workout-1");

      expect(count).toBe(0);
    });

    it("should return 0 when exception is thrown", async () => {
      const mockSupabase = {
        from: vi.fn(() => mockSupabase),
        select: vi.fn(() => mockSupabase),
        eq: vi.fn().mockRejectedValue(new Error("Network error")),
      };

      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

      const count = await countExercisesForWorkout("workout-1");

      expect(count).toBe(0);
    });
  });
});

