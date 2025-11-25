import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Create a Supabase client for browser/client-side usage
 * This client uses the anon key and will respect RLS policies
 * 
 * Note: Since we're using Clerk (not Supabase Auth), the browser client won't have
 * automatic user context. Consider using API routes instead for authenticated operations.
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}


