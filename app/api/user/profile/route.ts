import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getSubscriptionByUserId } from "@/lib/db/queries/subscriptions";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/user";

/**
 * GET /api/user/profile
 * 
 * Returns the current user's profile including subscription information.
 * Used by SubscriptionContext to fetch subscription data.
 */
export async function GET() {
  try {
    const clerkUserId = await getCurrentUserId();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    // If user doesn't exist yet (e.g., first-time signup), return default free plan
    // This allows SubscriptionContext to work even for new users
    let user;
    try {
      user = await getUserByClerkId(clerkUserId);
    } catch (userError) {
      // User not found in database - return default subscription
      // This is expected for new users who haven't been synced to the database yet
      const errorMessage = userError instanceof Error ? userError.message : String(userError);
      if (errorMessage.includes("Failed to get user") || errorMessage.includes("not found")) {
        console.warn("User not found in database, returning default subscription");
        return NextResponse.json({
          clerk_user_id: clerkUserId,
          subscription_plan: "free" as SubscriptionPlan,
          subscription_status: "active" as SubscriptionStatus,
        });
      }
      // Re-throw if it's a different error (e.g., database connection issue)
      throw userError;
    }
    
    // Get subscription if it exists
    const subscription = await getSubscriptionByUserId(user.id);

    // Use subscription table if available, otherwise fall back to user table
    const subscription_plan = (subscription?.plan_type ||
      user.subscription_plan ||
      "free") as SubscriptionPlan;
    const subscription_status = (subscription?.status ||
      user.subscription_status ||
      "active") as SubscriptionStatus;

    return NextResponse.json({
      id: user.id,
      clerk_user_id: user.clerk_user_id,
      email: user.email,
      name: user.name,
      subscription_plan: subscription_plan,
      subscription_status: subscription_status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

