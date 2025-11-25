import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";

/**
 * Authentication middleware for API routes (Proxy Pattern)
 * 
 * This utility provides server-side authentication checks for API routes
 * following Next.js 16's proxy pattern. All authentication is handled
 * server-side using Clerk's auth() function.
 */

/**
 * Result of authentication check
 */
export interface AuthResult {
  clerkUserId: string;
  userId: string; // Database user ID
}

/**
 * Authenticate a request and return user IDs
 * Throws an error or returns null if not authenticated
 */
export async function authenticateRequest(): Promise<AuthResult> {
  const clerkUserId = await getCurrentUserId();
  
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserByClerkId(clerkUserId);
  
  return {
    clerkUserId,
    userId: user.id,
  };
}

/**
 * Wrapper for API route handlers that require authentication
 * Returns authenticated user info or sends 401 response
 */
export async function withAuth<T>(
  handler: (auth: AuthResult, ...args: unknown[]) => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  try {
    const auth = await authenticateRequest();
    return await handler(auth);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ) as NextResponse<T>;
    }
    throw error;
  }
}

/**
 * Verify that a client belongs to the authenticated user
 * Throws an error if client doesn't belong to user
 */
export async function verifyClientOwnership(
  clientId: string,
  userId: string
): Promise<void> {
  const { getClientById } = await import("@/lib/db/queries/clients");
  const client = await getClientById(clientId);
  
  if (client.trainer_id !== userId) {
    throw new Error("Unauthorized: Client does not belong to you");
  }
}

/**
 * Verify that a workout belongs to the authenticated user's client
 * Throws an error if workout doesn't belong to user
 */
export async function verifyWorkoutOwnership(
  workoutId: string,
  userId: string
): Promise<void> {
  const { getWorkoutById } = await import("@/lib/db/queries/workouts");
  const workout = await getWorkoutById(workoutId);
  
  const { getClientById } = await import("@/lib/db/queries/clients");
  const client = await getClientById(workout.client_id);
  
  if (client.trainer_id !== userId) {
    throw new Error("Unauthorized: Workout does not belong to you");
  }
}

/**
 * Verify that a package belongs to the authenticated user's client
 * Throws an error if package doesn't belong to user
 */
export async function verifyPackageOwnership(
  packageId: string,
  userId: string
): Promise<void> {
  const { getPackageById } = await import("@/lib/db/queries/packages");
  const packageData = await getPackageById(packageId);
  
  const { getClientById } = await import("@/lib/db/queries/clients");
  const client = await getClientById(packageData.client_id);
  
  if (client.trainer_id !== userId) {
    throw new Error("Unauthorized: Package does not belong to you");
  }
}

