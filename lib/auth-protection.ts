import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

/**
 * Protect a route - redirects to sign-in if not authenticated
 * Use this in route handlers or server components
 */
export async function protectRoute() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return userId;
}

/**
 * Get authenticated user ID or null
 * Use this when you want to handle unauthenticated state yourself
 */
export async function getUserIdOrNull(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if a request is from an authenticated user
 */
export async function isAuthenticatedRequest(
  request: NextRequest
): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

