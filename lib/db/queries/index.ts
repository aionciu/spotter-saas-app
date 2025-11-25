/**
 * Database Query Utilities
 * 
 * This directory contains data access functions for interacting with Supabase.
 * All queries should go through these utilities to ensure proper authorization
 * and type safety.
 * 
 * Structure:
 * - users.ts - User-related queries
 * - clients.ts - Client-related queries
 * - packages.ts - Package-related queries
 * - workouts.ts - Workout and exercise-related queries
 * - subscriptions.ts - Subscription-related queries
 */

export * from "./users";
export * from "./clients";
export * from "./packages";
export * from "./workouts";
export * from "./subscriptions";

