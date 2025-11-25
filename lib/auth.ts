import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getAuthUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  return await currentUser();
}

/**
 * Check if the current request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

/**
 * Get subscription metadata from Clerk user metadata
 */
export async function getSubscriptionMetadata() {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  return {
    plan: (user.publicMetadata?.subscriptionPlan as string) || "free",
    status: (user.publicMetadata?.subscriptionStatus as string) || "active",
    limits: user.publicMetadata?.limits as Record<string, unknown> | undefined,
  };
}

