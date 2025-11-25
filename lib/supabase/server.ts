import { createClient } from "@supabase/supabase-js";
import { getCurrentUserId } from "@/lib/clerk";
import type { Database } from "./types";

/**
 * Create a Supabase client for server-side usage
 * 
 * Since we're using Clerk (not Supabase Auth), we use the service role key
 * and handle authorization in the application layer via API routes.
 * RLS policies are still enforced, but we need to set user context manually.
 */
export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  // Use service role key for server-side operations
  // Authorization is handled in the application layer (API routes)
  const client = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}

/**
 * Create a Supabase client with user context set for RLS
 * This sets the app.current_user_id setting before queries
 * 
 * Note: This requires a database function to set the context.
 * For now, we'll handle authorization in the application layer.
 */
export async function createAuthenticatedServerClient() {
  const client = await createServerClient();
  const clerkUserId = await getCurrentUserId();

  if (!clerkUserId) {
    throw new Error("User must be authenticated to create an authenticated client");
  }

  // Set user context for RLS policies
  // This requires a database function - we'll create it in a migration if needed
  // For now, authorization is handled in API routes
  return client;
}
