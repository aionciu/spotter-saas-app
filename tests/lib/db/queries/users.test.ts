import { describe, it, expect, vi, beforeEach } from "vitest";
import { createServerClient } from "@/lib/supabase/server";
import {
  getUserByClerkId,
  getUserById,
  createUser,
  updateUser,
  getOrCreateUserByClerkId,
} from "@/lib/db/queries/users";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

describe("User Query Functions", () => {
  const mockSupabase = {
    from: vi.fn(() => mockSupabase),
    select: vi.fn(() => mockSupabase),
    eq: vi.fn(() => mockSupabase),
    single: vi.fn(),
    insert: vi.fn(() => mockSupabase),
    update: vi.fn(() => mockSupabase),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);
  });

  describe("getUserByClerkId", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "user-id",
        clerk_user_id: "clerk-123",
        email: "test@example.com",
        name: "Test User",
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await getUserByClerkId("clerk-123");

      expect(result).toEqual(mockUser);
      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockSupabase.eq).toHaveBeenCalledWith("clerk_user_id", "clerk-123");
    });

    it("should throw error when user not found", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "User not found", code: "PGRST116" },
      });

      await expect(getUserByClerkId("clerk-123")).rejects.toThrow("Failed to get user");
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = {
        clerk_user_id: "clerk-123",
        email: "test@example.com",
        name: "Test User",
      };

      const mockCreatedUser = {
        id: "user-id",
        ...userData,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedUser,
        error: null,
      });

      const result = await createUser(userData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockSupabase.insert).toHaveBeenCalledWith(userData);
    });

    it("should throw error on creation failure", async () => {
      const userData = {
        clerk_user_id: "clerk-123",
        email: "test@example.com",
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "Duplicate key", code: "23505" },
      });

      await expect(createUser(userData)).rejects.toThrow("Failed to create user");
    });
  });

  describe("getOrCreateUserByClerkId", () => {
    it("should return existing user if found", async () => {
      const mockUser = {
        id: "user-id",
        clerk_user_id: "clerk-123",
        email: "test@example.com",
        name: "Test User",
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      const result = await getOrCreateUserByClerkId(
        "clerk-123",
        "test@example.com",
        "Test User"
      );

      expect(result).toEqual(mockUser);
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it("should create user if not found", async () => {
      const mockCreatedUser = {
        id: "user-id",
        clerk_user_id: "clerk-123",
        email: "test@example.com",
        name: "Test User",
      };

      // First call (getUserByClerkId) fails
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      // Second call (createUser) succeeds
      mockSupabase.single.mockResolvedValueOnce({
        data: mockCreatedUser,
        error: null,
      });

      const result = await getOrCreateUserByClerkId(
        "clerk-123",
        "test@example.com",
        "Test User"
      );

      expect(result).toEqual(mockCreatedUser);
      expect(mockSupabase.insert).toHaveBeenCalled();
    });
  });
});

