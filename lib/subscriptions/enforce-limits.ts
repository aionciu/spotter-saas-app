import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getUserSubscription } from "./utils";
import {
  checkClientLimit,
  checkPackageLimit,
  checkWorkoutLimit,
  checkExerciseLimit,
  canPerformAction,
} from "./enforcement";
import {
  countClientsForTrainer,
  countPackagesForClient,
  countWorkoutsForClient,
  countExercisesForWorkout,
} from "./usage";
import { getClientById } from "@/lib/db/queries/clients";

/**
 * Check if user can create a new client
 * Throws an error if limit is exceeded
 */
export async function enforceClientLimit(): Promise<void> {
  const clerkUserId = await getCurrentUserId();
  if (!clerkUserId) {
    throw new Error("Authentication required");
  }

  const user = await getUserByClerkId(clerkUserId);
  const subscription = await getUserSubscription(clerkUserId);

  if (!subscription) {
    throw new Error("Failed to get subscription");
  }

  // Check if subscription is active
  if (!canPerformAction(subscription.plan, subscription.status)) {
    throw new Error("Your subscription is not active. Please renew your subscription to continue.");
  }

  // Count current clients
  const currentClientCount = await countClientsForTrainer(user.id);

  // Check limit
  const limitCheck = checkClientLimit(subscription.plan, currentClientCount);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || "Client limit exceeded");
  }
}

/**
 * Check if user can create a new package for a client
 * Throws an error if limit is exceeded
 */
export async function enforcePackageLimit(clientId: string): Promise<void> {
  const clerkUserId = await getCurrentUserId();
  if (!clerkUserId) {
    throw new Error("Authentication required");
  }

  const subscription = await getUserSubscription(clerkUserId);
  if (!subscription) {
    throw new Error("Failed to get subscription");
  }

  // Check if subscription is active
  if (!canPerformAction(subscription.plan, subscription.status)) {
    throw new Error("Your subscription is not active. Please renew your subscription to continue.");
  }

  // Verify client belongs to user
  const client = await getClientById(clientId);
  const user = await getUserByClerkId(clerkUserId);
  if (client.trainer_id !== user.id) {
    throw new Error("Unauthorized: Client does not belong to you");
  }

  // Count current packages for this client
  const currentPackageCount = await countPackagesForClient(clientId);

  // Check limit
  const limitCheck = checkPackageLimit(subscription.plan, currentPackageCount);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || "Package limit exceeded");
  }
}

/**
 * Check if user can create a new workout for a client
 * Throws an error if limit is exceeded
 */
export async function enforceWorkoutLimit(clientId: string): Promise<void> {
  const clerkUserId = await getCurrentUserId();
  if (!clerkUserId) {
    throw new Error("Authentication required");
  }

  const subscription = await getUserSubscription(clerkUserId);
  if (!subscription) {
    throw new Error("Failed to get subscription");
  }

  // Check if subscription is active
  if (!canPerformAction(subscription.plan, subscription.status)) {
    throw new Error("Your subscription is not active. Please renew your subscription to continue.");
  }

  // Verify client belongs to user
  const client = await getClientById(clientId);
  const user = await getUserByClerkId(clerkUserId);
  if (client.trainer_id !== user.id) {
    throw new Error("Unauthorized: Client does not belong to you");
  }

  // Count current workouts for this client
  const currentWorkoutCount = await countWorkoutsForClient(clientId);

  // Check limit
  const limitCheck = checkWorkoutLimit(subscription.plan, currentWorkoutCount);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || "Workout limit exceeded");
  }
}

/**
 * Check if user can add a new exercise to a workout
 * Throws an error if limit is exceeded
 */
export async function enforceExerciseLimit(workoutId: string): Promise<void> {
  const clerkUserId = await getCurrentUserId();
  if (!clerkUserId) {
    throw new Error("Authentication required");
  }

  const subscription = await getUserSubscription(clerkUserId);
  if (!subscription) {
    throw new Error("Failed to get subscription");
  }

  // Check if subscription is active
  if (!canPerformAction(subscription.plan, subscription.status)) {
    throw new Error("Your subscription is not active. Please renew your subscription to continue.");
  }

  // Verify workout belongs to user's client
  const { getWorkoutById } = await import("@/lib/db/queries/workouts");
  const workout = await getWorkoutById(workoutId);
  const client = await getClientById(workout.client_id);
  const user = await getUserByClerkId(clerkUserId);
  if (client.trainer_id !== user.id) {
    throw new Error("Unauthorized: Workout does not belong to you");
  }

  // Count current exercises for this workout
  const currentExerciseCount = await countExercisesForWorkout(workoutId);

  // Check limit
  const limitCheck = checkExerciseLimit(subscription.plan, currentExerciseCount);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || "Exercise limit exceeded");
  }
}

