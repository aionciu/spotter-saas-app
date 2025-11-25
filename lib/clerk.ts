import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

/**
 * Get the current authenticated user from Clerk
 */
export async function getCurrentUser() {
  return await currentUser();
}

/**
 * Get the current user's Clerk ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Get the Clerk client instance for server-side operations
 */
export function getClerkClient() {
  return clerkClient();
}

/**
 * Get the auth object for checking authentication state
 */
export function getAuth() {
  return auth();
}

