"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/user";
import type { PlanLimits } from "@/lib/subscriptions/plans";
import { getPlanLimits } from "@/lib/subscriptions/plans";

interface SubscriptionContextValue {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  limits: PlanLimits;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined
);

interface SubscriptionProviderProps {
  children: React.ReactNode;
  initialPlan?: SubscriptionPlan;
  initialStatus?: SubscriptionStatus;
}

/**
 * Subscription Context Provider
 * 
 * Provides subscription information to all components in the app.
 * Fetches subscription data from the API and provides it via context.
 */
export function SubscriptionProvider({
  children,
  initialPlan = "free",
  initialStatus = "active",
}: SubscriptionProviderProps) {
  const [plan, setPlan] = useState<SubscriptionPlan>(initialPlan);
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limits = getPlanLimits(plan);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();
      setPlan(data.subscription_plan || "free");
      setStatus(data.subscription_status || "active");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription");
      // Fall back to defaults on error
      setPlan("free");
      setStatus("active");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch subscription on mount
    refresh();
  }, [refresh]);

  const value: SubscriptionContextValue = {
    plan,
    status,
    limits,
    isLoading,
    error,
    refresh,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to access subscription context
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}

