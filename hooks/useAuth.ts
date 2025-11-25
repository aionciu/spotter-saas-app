"use client";

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";

/**
 * Auth state hook
 * 
 * Provides convenient access to Clerk authentication state.
 * Wraps Clerk's useUser and useAuth hooks for easier usage.
 */
export function useAuth() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, userId, sessionId } = useClerkAuth();

  return {
    user,
    userId,
    sessionId,
    isSignedIn: isSignedIn ?? false,
    isLoading: !isUserLoaded,
    isAuthenticated: isSignedIn ?? false,
  };
}

