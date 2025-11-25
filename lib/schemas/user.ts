import { z } from "zod";

/**
 * Zod schema for user subscription plan
 */
export const subscriptionPlanSchema = z.enum(["free", "pro", "ultra"]);

/**
 * Zod schema for user subscription status
 */
export const subscriptionStatusSchema = z.enum([
  "active",
  "past_due",
  "canceled",
]);

/**
 * Zod schema for user creation/update
 */
export const userSchema = z.object({
  clerk_user_id: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  subscription_plan: subscriptionPlanSchema.optional(),
  subscription_status: subscriptionStatusSchema.optional(),
});

/**
 * Zod schema for user profile response
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  subscription_plan: subscriptionPlanSchema,
  subscription_status: subscriptionStatusSchema,
});

