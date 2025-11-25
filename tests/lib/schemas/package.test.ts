import { describe, it, expect } from "vitest";
import {
  createPackageSchema,
  updatePackageSchema,
} from "@/lib/schemas/package";

describe("Package Schemas", () => {
  describe("createPackageSchema", () => {
    it("should validate valid package data", () => {
      const validData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        total_sessions: 10,
        expiration_date: new Date().toISOString(),
      };

      const result = createPackageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate package without expiration date", () => {
      const validData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        total_sessions: 10,
      };

      const result = createPackageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const invalidData = {
        client_id: "not-a-uuid",
        total_sessions: 10,
      };

      const result = createPackageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Invalid client ID");
      }
    });

    it("should reject negative sessions", () => {
      const invalidData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        total_sessions: -5,
      };

      const result = createPackageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("greater than 0");
      }
    });

    it("should reject zero sessions", () => {
      const invalidData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        total_sessions: 0,
      };

      const result = createPackageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer sessions", () => {
      const invalidData = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        total_sessions: 10.5,
      };

      const result = createPackageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });
  });

  describe("updatePackageSchema", () => {
    it("should validate partial update data", () => {
      const validData = {
        total_sessions: 20,
      };

      const result = updatePackageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate empty object (all fields optional)", () => {
      const validData = {};

      const result = updatePackageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative remaining sessions", () => {
      const invalidData = {
        remaining_sessions: -1,
      };

      const result = updatePackageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("negative");
      }
    });

    it("should accept zero remaining sessions", () => {
      const validData = {
        remaining_sessions: 0,
      };

      const result = updatePackageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

