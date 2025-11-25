import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserSubscription, hasFeatureAccess } from "@/lib/subscriptions/utils";
import {
  checkClientLimit,
  checkPackageLimit,
  checkWorkoutLimit,
  checkExerciseLimit,
  getUpgradeRecommendation,
} from "@/lib/subscriptions/enforcement";
import { getPlanLimits, hasFeature } from "@/lib/subscriptions/plans";

/**
 * Test endpoint to verify subscription system
 * GET /api/test/subscription
 * 
 * This endpoint tests:
 * - Subscription plan definitions
 * - Limit checking functions
 * - Feature access
 * - Upgrade recommendations
 */
export async function GET() {
  try {
    const clerkUserId = await getCurrentUserId();

    if (!clerkUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const results: Record<string, unknown> = {};

    // Test 1: Get user subscription
    try {
      const subscription = await getUserSubscription(clerkUserId);
      results.getUserSubscription = {
        success: true,
        data: subscription,
      };
    } catch (error) {
      results.getUserSubscription = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 2: Test plan limits for all plans
    const planTests: Record<string, unknown> = {};
    for (const plan of ["free", "pro", "ultra"] as const) {
      const limits = getPlanLimits(plan);
      planTests[plan] = {
        limits,
        features: {
          aiWorkoutGeneration: hasFeature(plan, "aiWorkoutGeneration"),
          advancedAnalytics: hasFeature(plan, "advancedAnalytics"),
          customBranding: hasFeature(plan, "customBranding"),
          apiAccess: hasFeature(plan, "apiAccess"),
          prioritySupport: hasFeature(plan, "prioritySupport"),
        },
      };
    }
    results.planLimits = planTests;

    // Test 3: Test limit checking functions
    const limitTests: Record<string, unknown> = {};

    // Test client limits
    limitTests.clientLimits = {
      free: {
        within: checkClientLimit("free", 3),
        atLimit: checkClientLimit("free", 5),
        exceeded: checkClientLimit("free", 6),
      },
      pro: {
        within: checkClientLimit("pro", 25),
        atLimit: checkClientLimit("pro", 50),
        exceeded: checkClientLimit("pro", 51),
      },
      ultra: {
        unlimited: checkClientLimit("ultra", 1000),
      },
    };

    // Test package limits
    limitTests.packageLimits = {
      free: checkPackageLimit("free", 2),
      pro: checkPackageLimit("pro", 5),
      ultra: checkPackageLimit("ultra", 100),
    };

    // Test workout limits
    limitTests.workoutLimits = {
      free: checkWorkoutLimit("free", 5),
      pro: checkWorkoutLimit("pro", 50),
      ultra: checkWorkoutLimit("ultra", 500),
    };

    // Test exercise limits
    limitTests.exerciseLimits = {
      free: checkExerciseLimit("free", 10),
      pro: checkExerciseLimit("pro", 15),
      ultra: checkExerciseLimit("ultra", 50),
    };

    results.limitChecks = limitTests;

    // Test 4: Test upgrade recommendations
    const upgradeTests: Record<string, unknown> = {
      freeHittingLimits: getUpgradeRecommendation("free", {
        clientCount: 6,
        packageCount: 4,
        workoutCount: 11,
      }),
      freeWithinLimits: getUpgradeRecommendation("free", {
        clientCount: 3,
        packageCount: 2,
        workoutCount: 5,
      }),
      proHittingLimits: getUpgradeRecommendation("pro", {
        clientCount: 51,
        packageCount: 11,
        workoutCount: 101,
      }),
      ultraUnlimited: getUpgradeRecommendation("ultra", {
        clientCount: 1000,
        packageCount: 100,
        workoutCount: 500,
      }),
    };
    results.upgradeRecommendations = upgradeTests;

    // Test 5: Test feature access (if user subscription available)
    if (results.getUserSubscription && typeof results.getUserSubscription === 'object' && 'data' in results.getUserSubscription && results.getUserSubscription.data) {
      const subData = results.getUserSubscription.data as { plan: string };
      try {
        const hasAI = await hasFeatureAccess(clerkUserId, "aiWorkoutGeneration");
        results.featureAccess = {
          aiWorkoutGeneration: hasAI,
          plan: subData.plan,
        };
      } catch (error) {
        results.featureAccess = {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Subscription system tests completed",
      clerk_user_id: clerkUserId,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

