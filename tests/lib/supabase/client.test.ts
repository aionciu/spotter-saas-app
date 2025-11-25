import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBrowserClient } from "@/lib/supabase/client";

describe("Supabase Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBrowserClient", () => {
    it("should create client with valid environment variables", () => {
      const client = createBrowserClient();
      expect(client).toBeDefined();
    });

    it("should throw error when SUPABASE_URL is missing", () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      expect(() => createBrowserClient()).toThrow("Missing Supabase environment variables");

      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    });

    it("should throw error when SUPABASE_ANON_KEY is missing", () => {
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => createBrowserClient()).toThrow("Missing Supabase environment variables");

      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    });
  });
});

