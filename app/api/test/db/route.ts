import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk";
import { NextResponse } from "next/server";

/**
 * Test endpoint to verify Supabase client setup
 * GET /api/test/db
 * 
 * This endpoint tests:
 * - Supabase client connection
 * - Database query execution
 * - Authentication context
 */
export async function GET() {
  try {
    // Test 1: Verify Supabase client can be created
    const supabase = await createServerClient();

    // Test 2: Check if we can query the users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, clerk_user_id, email")
      .limit(1);

    if (usersError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to query users table",
          details: usersError.message,
          test: "database_query",
        },
        { status: 500 }
      );
    }

    // Test 3: Check if we can query the clients table
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, name")
      .limit(1);

    if (clientsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to query clients table",
          details: clientsError.message,
          test: "database_query",
        },
        { status: 500 }
      );
    }

    // Test 4: Get current user ID from Clerk
    const clerkUserId = await getCurrentUserId();

    return NextResponse.json({
      success: true,
      message: "Database connection and queries successful",
      tests: {
        supabase_client: "✅ Created successfully",
        users_table: "✅ Query successful",
        clients_table: "✅ Query successful",
        clerk_auth: clerkUserId ? "✅ Authenticated" : "⚠️ Not authenticated",
      },
      data: {
        users_count: users?.length ?? 0,
        clients_count: clients?.length ?? 0,
        clerk_user_id: clerkUserId,
      },
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

