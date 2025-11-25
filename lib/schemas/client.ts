import { z } from "zod";

/**
 * Zod schema for client gender
 */
export const clientGenderSchema = z.enum(["male", "female", "other"]);

/**
 * Zod schema for creating a client
 */
export const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required").max(255),
  gender: clientGenderSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * Zod schema for updating a client
 */
export const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  gender: clientGenderSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * Zod schema for client response
 */
export const clientSchema = z.object({
  id: z.string().uuid(),
  trainer_id: z.string().uuid(),
  name: z.string(),
  gender: clientGenderSchema.nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

