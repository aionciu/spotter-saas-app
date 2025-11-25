import { createServerClient } from "@/lib/supabase/server";
import { getClientsByTrainerId } from "@/lib/db/queries/clients";
import { getPackagesByClientId } from "@/lib/db/queries/packages";
import { getWorkoutsByClientId } from "@/lib/db/queries/workouts";

/**
 * Count the number of clients for a trainer
 */
export async function countClientsForTrainer(trainerId: string): Promise<number> {
  try {
    const clients = await getClientsByTrainerId(trainerId);
    return clients.length;
  } catch {
    return 0;
  }
}

/**
 * Count the number of packages for a specific client
 */
export async function countPackagesForClient(clientId: string): Promise<number> {
  try {
    const packages = await getPackagesByClientId(clientId);
    return packages.length;
  } catch {
    return 0;
  }
}

/**
 * Count the number of workouts for a specific client
 */
export async function countWorkoutsForClient(clientId: string): Promise<number> {
  try {
    const workouts = await getWorkoutsByClientId(clientId);
    return workouts.length;
  } catch {
    return 0;
  }
}

/**
 * Count the number of exercises for a specific workout
 */
export async function countExercisesForWorkout(workoutId: string): Promise<number> {
  const supabase = await createServerClient();
  try {
    const { count, error } = await supabase
      .from("exercises")
      .select("*", { count: "exact", head: true })
      .eq("workout_id", workoutId);

    if (error) {
      throw error;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
}

