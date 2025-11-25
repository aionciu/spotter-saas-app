import { z } from "zod";

/**
 * Zod schema for creating a package
 */
export const createPackageSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  total_sessions: z
    .number()
    .int("Total sessions must be an integer")
    .positive("Total sessions must be greater than 0"),
  expiration_date: z.string().datetime().nullable().optional(),
});

/**
 * Zod schema for updating a package
 */
export const updatePackageSchema = z.object({
  total_sessions: z.number().int().positive().optional(),
  remaining_sessions: z
    .number()
    .int("Remaining sessions must be an integer")
    .nonnegative("Remaining sessions cannot be negative")
    .optional(),
  expiration_date: z.string().datetime().nullable().optional(),
  is_active: z.boolean().optional(),
});

/**
 * Zod schema for package response
 */
export const packageSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  total_sessions: z.number().int().positive(),
  remaining_sessions: z.number().int().nonnegative(),
  expiration_date: z.string().datetime().nullable(),
  is_active: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

