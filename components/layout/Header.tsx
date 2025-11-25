"use client";

import { UserButton } from "@clerk/nextjs";
import { useSubscription } from "@/hooks/useSubscription";

/**
 * Format subscription plan name for display
 */
function formatPlanName(plan: string): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

/**
 * Header Component
 * 
 * Top header with user info and subscription plan badge.
 * Displays user button from Clerk and current subscription plan.
 */
export function Header() {
  const { plan, isLoading } = useSubscription();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">SPOTTER</h1>
          {!isLoading && (
            <span className="text-xs rounded-full bg-primary/10 px-2 py-1 text-primary">
              {formatPlanName(plan)}
            </span>
          )}
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}

