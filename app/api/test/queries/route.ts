import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId, getOrCreateUserByClerkId } from "@/lib/db/queries/users";
import { getClientsByTrainerId } from "@/lib/db/queries/clients";
import { NextResponse } from "next/server";

/**
 * Test endpoint to verify database query utilities
 * GET /api/test/queries
 * 
 * This endpoint tests:
 * - User query functions
 * - Client query functions
 * - Error handling
 */
export async function GET() {
  try {
    const clerkUserId = await getCurrentUserId();

    if (!clerkUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "Please sign in to test queries",
        },
        { status: 401 }
      );
    }

    const results: Record<string, unknown> = {
      clerk_user_id: clerkUserId,
    };

    // Test 1: Try to get user by Clerk ID
    try {
      const user = await getUserByClerkId(clerkUserId);
      results.getUserByClerkId = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      results.getUserByClerkId = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 2: Get or create user (should work even if user doesn't exist)
    let dbUserId: string | null = null;
    try {
      const user = await getOrCreateUserByClerkId(
        clerkUserId,
        `test-${clerkUserId}@example.com`,
        "Test User"
      );
      dbUserId = user.id;
      results.getOrCreateUserByClerkId = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      results.getOrCreateUserByClerkId = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 3: Get clients for this user (as trainer)
    if (dbUserId) {
      try {
        const clients = await getClientsByTrainerId(dbUserId);
        results.getClientsByTrainerId = {
          success: true,
          count: clients.length,
          data: clients,
        };
      } catch (error) {
        results.getClientsByTrainerId = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Query utilities test completed",
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

