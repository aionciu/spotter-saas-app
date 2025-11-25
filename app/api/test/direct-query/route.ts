import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk";
import { NextResponse } from "next/server";

/**
 * Test endpoint to verify direct Supabase queries
 * GET /api/test/direct-query
 * 
 * This endpoint tests direct Supabase queries without using query utilities
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

    const supabase = await createServerClient();

    // Test 1: Direct query to users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    // Test 2: Try to insert a user if it doesn't exist
    let insertResult = null;
    if (!users && !usersError) {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          clerk_user_id: clerkUserId,
          email: `test-${clerkUserId}@example.com`,
          name: "Test User",
        })
        .select()
        .single();

      insertResult = {
        success: !insertError,
        error: insertError
          ? {
              message: insertError.message,
              code: insertError.code,
              details: insertError.details,
              hint: insertError.hint,
            }
          : null,
        data: newUser,
      };
    }

    return NextResponse.json({
      success: true,
      clerk_user_id: clerkUserId,
      tests: {
        direct_query: {
          success: !usersError,
          error: usersError
            ? {
                message: usersError.message,
                code: usersError.code,
                details: usersError.details,
                hint: usersError.hint,
              }
            : null,
          data: users,
        },
        direct_insert: insertResult,
      },
      environment_check: {
        supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        service_role_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        service_role_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

