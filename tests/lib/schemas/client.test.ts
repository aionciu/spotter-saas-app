import { describe, it, expect } from "vitest";
import {
  createClientSchema,
  updateClientSchema,
  clientGenderSchema,
} from "@/lib/schemas/client";

describe("Client Schemas", () => {
  describe("createClientSchema", () => {
    it("should validate valid client data", () => {
      const validData = {
        name: "John Doe",
        gender: "male" as const,
        notes: "Test client",
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate client without optional fields", () => {
      const validData = {
        name: "Jane Doe",
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        gender: "female" as const,
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("required");
      }
    });

    it("should reject missing name", () => {
      const invalidData = {
        gender: "male" as const,
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid gender", () => {
      const invalidData = {
        name: "Test Client",
        gender: "invalid" as any,
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept null gender", () => {
      const validData = {
        name: "Test Client",
        gender: null,
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject name longer than 255 characters", () => {
      const invalidData = {
        name: "a".repeat(256),
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("255");
      }
    });
  });

  describe("updateClientSchema", () => {
    it("should validate partial update data", () => {
      const validData = {
        name: "Updated Name",
      };

      const result = updateClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate empty object (all fields optional)", () => {
      const validData = {};

      const result = updateClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid name when provided", () => {
      const invalidData = {
        name: "",
      };

      const result = updateClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("clientGenderSchema", () => {
    it("should accept valid gender values", () => {
      expect(clientGenderSchema.safeParse("male").success).toBe(true);
      expect(clientGenderSchema.safeParse("female").success).toBe(true);
      expect(clientGenderSchema.safeParse("other").success).toBe(true);
    });

    it("should reject invalid gender values", () => {
      expect(clientGenderSchema.safeParse("invalid").success).toBe(false);
      expect(clientGenderSchema.safeParse("").success).toBe(false);
    });
  });
});
