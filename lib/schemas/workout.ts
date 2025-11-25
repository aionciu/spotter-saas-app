import { z } from "zod";

/**
 * Zod schema for workout status
 */
export const workoutStatusSchema = z.enum([
  "planned",
  "in_progress",
  "completed",
  "cancelled",
]);

/**
 * Zod schema for creating a workout
 */
export const createWorkoutSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  name: z.string().min(1, "Workout name is required").max(255),
  date: z.string().datetime().optional(),
  status: workoutStatusSchema.optional(),
});

/**
 * Zod schema for updating a workout
 */
export const updateWorkoutSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  date: z.string().datetime().optional(),
  status: workoutStatusSchema.optional(),
});

/**
 * Zod schema for creating an exercise
 */
export const createExerciseSchema = z.object({
  workout_id: z.string().uuid("Invalid workout ID"),
  exercise_name: z.string().min(1, "Exercise name is required").max(255),
  sets: z.number().int("Sets must be an integer").positive("Sets must be greater than 0"),
  reps: z.number().int("Reps must be an integer").positive().nullable().optional(),
  weight: z.number().positive("Weight must be positive").nullable().optional(),
  order_index: z.number().int().nonnegative().optional(),
});

/**
 * Zod schema for updating an exercise
 */
export const updateExerciseSchema = z.object({
  exercise_name: z.string().min(1).max(255).optional(),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  order_index: z.number().int().nonnegative().optional(),
});

/**
 * Zod schema for logging an exercise set
 */
export const createExerciseLogSchema = z.object({
  exercise_id: z.string().uuid("Invalid exercise ID"),
  set_number: z.number().int("Set number must be an integer").positive("Set number must be greater than 0"),
  reps_completed: z.number().int().positive().nullable().optional(),
  weight_used: z.number().positive().nullable().optional(),
});

/**
 * Zod schema for workout response
 */
export const workoutSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  name: z.string(),
  date: z.string().datetime().nullable(),
  status: workoutStatusSchema.nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Zod schema for exercise response
 */
export const exerciseSchema = z.object({
  id: z.string().uuid(),
  workout_id: z.string().uuid(),
  exercise_name: z.string(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive().nullable(),
  weight: z.number().positive().nullable(),
  order_index: z.number().int().nonnegative(),
  created_at: z.string().nullable(),
});

