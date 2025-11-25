import type { Tables } from "@/lib/supabase/types";

/**
 * Workout type from database
 */
export type Workout = Tables<"workouts">;

/**
 * Exercise type from database
 */
export type Exercise = Tables<"exercises">;

/**
 * Exercise log type from database
 */
export type ExerciseLog = Tables<"exercise_logs">;

/**
 * Workout status
 */
export type WorkoutStatus = "planned" | "in_progress" | "completed" | "cancelled";

/**
 * Workout with exercises
 */
export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[];
}

/**
 * Exercise with logs
 */
export interface ExerciseWithLogs extends Exercise {
  logs?: ExerciseLog[];
}

/**
 * Workout creation input
 */
export interface CreateWorkoutInput {
  client_id: string;
  name: string;
  date?: string;
  status?: WorkoutStatus;
}

/**
 * Workout update input
 */
export interface UpdateWorkoutInput {
  name?: string;
  date?: string;
  status?: WorkoutStatus;
}

/**
 * Exercise creation input
 */
export interface CreateExerciseInput {
  workout_id: string;
  exercise_name: string;
  sets: number;
  reps?: number | null;
  weight?: number | null;
  order_index?: number;
}

/**
 * Exercise update input
 */
export interface UpdateExerciseInput {
  exercise_name?: string;
  sets?: number;
  reps?: number | null;
  weight?: number | null;
  order_index?: number;
}

/**
 * Exercise log creation input
 */
export interface CreateExerciseLogInput {
  exercise_id: string;
  set_number: number;
  reps_completed?: number | null;
  weight_used?: number | null;
}

