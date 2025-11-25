import { describe, it, expect } from "vitest";
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  createExerciseSchema,
  updateExerciseSchema,
  createExerciseLogSchema,
  workoutStatusSchema,
} from "@/lib/schemas/workout";

describe("Workout Schemas", () => {
  describe("createWorkoutSchema", () => {
    it("should validate valid workout data", () => {
      const validData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Morning Workout",
        status: "planned" as const,
      };

      const result = createWorkoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate workout without optional fields", () => {
      const validData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Evening Workout",
      };

      const result = createWorkoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const invalidData = {
        client_id: "not-a-uuid",
        name: "Test Workout",
      };

      const result = createWorkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Invalid client ID");
      }
    });

    it("should reject empty name", () => {
      const invalidData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "",
      };

      const result = createWorkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Workout",
        status: "invalid" as any,
      };

      const result = createWorkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createExerciseSchema", () => {
    it("should validate valid exercise data", () => {
      const validData = {
        workout_id: "123e4567-e89b-12d3-a456-426614174000",
        exercise_name: "Bench Press",
        sets: 3,
        reps: 10,
        weight: 100,
        order_index: 0,
      };

      const result = createExerciseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate exercise without optional fields", () => {
      const validData = {
        workout_id: "123e4567-e89b-12d3-a456-426614174000",
        exercise_name: "Squats",
        sets: 4,
      };

      const result = createExerciseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject zero sets", () => {
      const invalidData = {
        workout_id: "123e4567-e89b-12d3-a456-426614174000",
        exercise_name: "Test Exercise",
        sets: 0,
      };

      const result = createExerciseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative weight", () => {
      const invalidData = {
        workout_id: "123e4567-e89b-12d3-a456-426614174000",
        exercise_name: "Test Exercise",
        sets: 3,
        weight: -10,
      };

      const result = createExerciseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createExerciseLogSchema", () => {
    it("should validate valid exercise log data", () => {
      const validData = {
        exercise_id: "123e4567-e89b-12d3-a456-426614174000",
        set_number: 1,
        reps_completed: 10,
        weight_used: 100,
      };

      const result = createExerciseLogSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject zero set number", () => {
      const invalidData = {
        exercise_id: "123e4567-e89b-12d3-a456-426614174000",
        set_number: 0,
      };

      const result = createExerciseLogSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("workoutStatusSchema", () => {
    it("should accept valid status values", () => {
      expect(workoutStatusSchema.safeParse("planned").success).toBe(true);
      expect(workoutStatusSchema.safeParse("in_progress").success).toBe(true);
      expect(workoutStatusSchema.safeParse("completed").success).toBe(true);
      expect(workoutStatusSchema.safeParse("cancelled").success).toBe(true);
    });

    it("should reject invalid status values", () => {
      expect(workoutStatusSchema.safeParse("invalid").success).toBe(false);
      expect(workoutStatusSchema.safeParse("").success).toBe(false);
    });
  });
});

