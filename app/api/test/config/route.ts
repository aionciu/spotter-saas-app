import { NextResponse } from "next/server";

/**
 * Test endpoint to verify environment configuration
 * GET /api/test/config
 * 
 * This endpoint checks environment variables (without exposing sensitive values)
 */
export async function GET() {
  const config = {
    supabase_url: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      value: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...`
        : null,
    },
    supabase_anon_key: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0,
      starts_with: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) ?? null,
    },
    supabase_service_role_key: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
      starts_with: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) ?? null,
    },
    clerk_publishable_key: {
      exists: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      starts_with: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) ?? null,
    },
  };

  const allConfigured =
    config.supabase_url.exists &&
    config.supabase_anon_key.exists &&
    config.supabase_service_role_key.exists;

  return NextResponse.json({
    success: allConfigured,
    message: allConfigured
      ? "All environment variables are configured"
      : "Some environment variables are missing",
    config,
    recommendations: !config.supabase_service_role_key.exists
      ? [
          "SUPABASE_SERVICE_ROLE_KEY is missing. Get it from: Supabase Dashboard > Project Settings > API > service_role key",
        ]
      : config.supabase_service_role_key.length < 100
        ? [
            "SUPABASE_SERVICE_ROLE_KEY seems too short. Service role keys are typically 100+ characters.",
          ]
        : [],
  });
}

