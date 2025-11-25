import { describe, it, expect } from "vitest";
import {
  userSchema,
  userProfileSchema,
  subscriptionPlanSchema,
  subscriptionStatusSchema,
} from "@/lib/schemas/user";

describe("User Schemas", () => {
  describe("userSchema", () => {
    it("should validate valid user data", () => {
      const validData = {
        clerk_user_id: "user_123",
        email: "test@example.com",
        name: "Test User",
        subscription_plan: "pro" as const,
        subscription_status: "active" as const,
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate user without optional fields", () => {
      const validData = {
        clerk_user_id: "user_123",
        email: "test@example.com",
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        clerk_user_id: "user_123",
        email: "not-an-email",
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty clerk_user_id", () => {
      const invalidData = {
        clerk_user_id: "",
        email: "test@example.com",
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("userProfileSchema", () => {
    it("should validate valid user profile", () => {
      const validData = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        name: "Test User",
        subscription_plan: "pro" as const,
        subscription_status: "active" as const,
      };

      const result = userProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const invalidData = {
        id: "not-a-uuid",
        email: "test@example.com",
        name: null,
        subscription_plan: "free" as const,
        subscription_status: "active" as const,
      };

      const result = userProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("subscriptionPlanSchema", () => {
    it("should accept valid plan values", () => {
      expect(subscriptionPlanSchema.safeParse("free").success).toBe(true);
      expect(subscriptionPlanSchema.safeParse("pro").success).toBe(true);
      expect(subscriptionPlanSchema.safeParse("ultra").success).toBe(true);
    });

    it("should reject invalid plan values", () => {
      expect(subscriptionPlanSchema.safeParse("invalid").success).toBe(false);
      expect(subscriptionPlanSchema.safeParse("").success).toBe(false);
    });
  });

  describe("subscriptionStatusSchema", () => {
    it("should accept valid status values", () => {
      expect(subscriptionStatusSchema.safeParse("active").success).toBe(true);
      expect(subscriptionStatusSchema.safeParse("past_due").success).toBe(true);
      expect(subscriptionStatusSchema.safeParse("canceled").success).toBe(true);
    });

    it("should reject invalid status values", () => {
      expect(subscriptionStatusSchema.safeParse("invalid").success).toBe(false);
      expect(subscriptionStatusSchema.safeParse("").success).toBe(false);
    });
  });
});

