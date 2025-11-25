import { createServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type Workout = Tables<"workouts">;
export type WorkoutInsert = TablesInsert<"workouts">;
export type WorkoutUpdate = TablesUpdate<"workouts">;

export type Exercise = Tables<"exercises">;
export type ExerciseInsert = TablesInsert<"exercises">;
export type ExerciseUpdate = TablesUpdate<"exercises">;

export type ExerciseLog = Tables<"exercise_logs">;
export type ExerciseLogInsert = TablesInsert<"exercise_logs">;
export type ExerciseLogUpdate = TablesUpdate<"exercise_logs">;

/**
 * Get all workouts for a client
 */
export async function getWorkoutsByClientId(clientId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false });

  if (error) {
    throw new Error(`Failed to get workouts: ${error.message}`);
  }

  return data;
}

/**
 * Get workout by ID with exercises
 */
export async function getWorkoutById(workoutId: string) {
  const supabase = await createServerClient();
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .single();

  if (workoutError) {
    throw new Error(`Failed to get workout: ${workoutError.message}`);
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("exercises")
    .select("*")
    .eq("workout_id", workoutId)
    .order("order_index", { ascending: true });

  if (exercisesError) {
    throw new Error(`Failed to get exercises: ${exercisesError.message}`);
  }

  return {
    ...workout,
    exercises,
  };
}

/**
 * Create a new workout
 */
export async function createWorkout(workoutData: WorkoutInsert) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("workouts")
    .insert(workoutData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create workout: ${error.message}`);
  }

  return data;
}

/**
 * Update workout
 */
export async function updateWorkout(
  workoutId: string,
  updates: WorkoutUpdate
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("workouts")
    .update(updates)
    .eq("id", workoutId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update workout: ${error.message}`);
  }

  return data;
}

/**
 * Add exercise to workout
 */
export async function addExerciseToWorkout(exerciseData: ExerciseInsert) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("exercises")
    .insert(exerciseData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add exercise: ${error.message}`);
  }

  return data;
}

/**
 * Update exercise
 */
export async function updateExercise(
  exerciseId: string,
  updates: ExerciseUpdate
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("exercises")
    .update(updates)
    .eq("id", exerciseId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update exercise: ${error.message}`);
  }

  return data;
}

/**
 * Log exercise set completion
 */
export async function logExerciseSet(logData: ExerciseLogInsert) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("exercise_logs")
    .insert(logData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log exercise set: ${error.message}`);
  }

  return data;
}

/**
 * Get exercise logs for an exercise
 */
export async function getExerciseLogs(exerciseId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("exercise_id", exerciseId)
    .order("set_number", { ascending: true });

  if (error) {
    throw new Error(`Failed to get exercise logs: ${error.message}`);
  }

  return data;
}

