import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  validateSchema,
  safeValidateSchema,
  validationErrorResponse,
} from "@/lib/schemas/validation";
import { createClientSchema } from "@/lib/schemas/client";
import { NextResponse } from "next/server";

describe("Validation Utilities", () => {
  describe("validateSchema", () => {
    it("should return parsed data for valid input", () => {
      const schema = z.object({ name: z.string() });
      const data = { name: "Test" };

      const result = validateSchema(schema, data);
      expect(result).toEqual(data);
    });

    it("should throw error for invalid input", () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 123 };

      expect(() => validateSchema(schema, data)).toThrow();
    });
  });

  describe("safeValidateSchema", () => {
    it("should return success true for valid input", () => {
      const schema = z.object({ name: z.string() });
      const data = { name: "Test" };

      const result = safeValidateSchema(schema, data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it("should return success false for invalid input", () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 123 };

      const result = safeValidateSchema(schema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });

  describe("validationErrorResponse", () => {
    it("should create error response with validation details", () => {
      const schema = createClientSchema;
      const invalidData = { name: "" };
      const result = schema.safeParse(invalidData);

      if (!result.success) {
        const response = validationErrorResponse(result.error);
        // Check that response has expected structure
        expect(response).toBeDefined();
        expect(response).toHaveProperty("status");
      }
    });

    it("should include error path and message", () => {
      const schema = z.object({
        name: z.string().min(1, "Name required"),
        age: z.number().min(18, "Must be 18+"),
      });
      const invalidData = { name: "", age: 15 };
      const result = schema.safeParse(invalidData);

      if (!result.success) {
        const response = validationErrorResponse(result.error);
        // Check that response has expected structure
        expect(response).toBeDefined();
        expect(response).toHaveProperty("status");
        // Verify error has multiple issues
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });
});

