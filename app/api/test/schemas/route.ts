import { NextResponse } from "next/server";
import {
  createClientSchema,
  updateClientSchema,
  createPackageSchema,
  createWorkoutSchema,
  createExerciseSchema,
  createExerciseLogSchema,
} from "@/lib/schemas";
import { validateSchema, safeValidateSchema } from "@/lib/schemas/validation";

/**
 * Test endpoint to verify Zod schemas
 * GET /api/test/schemas
 * 
 * This endpoint tests:
 * - Schema validation functions
 * - Error handling for invalid data
 * - Type inference from schemas
 */
export async function GET() {
  const results: Record<string, unknown> = {};

  // Test 1: Valid client creation data
  try {
    const validClient = {
      name: "John Doe",
      gender: "male" as const,
      notes: "Test client",
    };
    const validated = validateSchema(createClientSchema, validClient);
    results.validClient = {
      success: true,
      data: validated,
    };
  } catch (error) {
    results.validClient = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 2: Invalid client creation data (missing required field)
  try {
    const invalidClient = {
      gender: "male" as const,
      // Missing required 'name' field
    };
    validateSchema(createClientSchema, invalidClient);
    results.invalidClient = {
      success: false,
      error: "Should have thrown validation error",
    };
  } catch (error) {
    results.invalidClient = {
      success: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 3: Safe validation (doesn't throw)
  const safeResult = safeValidateSchema(createClientSchema, {
    name: "Jane Doe",
    gender: "female" as const,
  });
  results.safeValidation = {
    success: safeResult.success,
    data: safeResult.success ? safeResult.data : null,
    error: !safeResult.success ? safeResult.error.issues : null,
  };

  // Test 4: Valid package creation
  try {
    const validPackage = {
      client_id: "123e4567-e89b-12d3-a456-426614174000",
      total_sessions: 10,
      expiration_date: new Date().toISOString(),
    };
    const validated = validateSchema(createPackageSchema, validPackage);
    results.validPackage = {
      success: true,
      data: validated,
    };
  } catch (error) {
    results.validPackage = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 5: Invalid package (negative sessions)
  const invalidPackageResult = safeValidateSchema(createPackageSchema, {
    client_id: "123e4567-e89b-12d3-a456-426614174000",
    total_sessions: -5, // Invalid: must be positive
  });
  results.invalidPackage = {
    success: invalidPackageResult.success,
    errors: !invalidPackageResult.success
      ? invalidPackageResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }))
      : null,
  };

  // Test 6: Valid workout creation
  try {
    const validWorkout = {
      client_id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Morning Workout",
      status: "planned" as const,
    };
    const validated = validateSchema(createWorkoutSchema, validWorkout);
    results.validWorkout = {
      success: true,
      data: validated,
    };
  } catch (error) {
    results.validWorkout = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 7: Valid exercise creation
  try {
    const validExercise = {
      workout_id: "123e4567-e89b-12d3-a456-426614174000",
      exercise_name: "Bench Press",
      sets: 3,
      reps: 10,
      weight: 100,
      order_index: 0,
    };
    const validated = validateSchema(createExerciseSchema, validExercise);
    results.validExercise = {
      success: true,
      data: validated,
    };
  } catch (error) {
    results.validExercise = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 8: Valid exercise log
  try {
    const validLog = {
      exercise_id: "123e4567-e89b-12d3-a456-426614174000",
      set_number: 1,
      reps_completed: 10,
      weight_used: 100,
    };
    const validated = validateSchema(createExerciseLogSchema, validLog);
    results.validExerciseLog = {
      success: true,
      data: validated,
    };
  } catch (error) {
    results.validExerciseLog = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 9: Update client schema (all fields optional)
  try {
    const updateData = {
      name: "Updated Name",
    };
    const validated = validateSchema(updateClientSchema, updateData);
    results.updateClient = {
      success: true,
      data: validated,
    };
  } catch (error) {
    results.updateClient = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 10: Invalid UUID format
  const invalidUuidResult = safeValidateSchema(createPackageSchema, {
    client_id: "not-a-valid-uuid",
    total_sessions: 10,
  });
  results.invalidUuid = {
    success: invalidUuidResult.success,
    errors: !invalidUuidResult.success
      ? invalidUuidResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }))
      : null,
  };

  const allTestsPassed = Object.values(results).every(
    (result) =>
      typeof result === "object" &&
      result !== null &&
      "success" in result &&
      result.success === true
  );

  return NextResponse.json({
    success: allTestsPassed,
    message: allTestsPassed
      ? "All schema validation tests passed"
      : "Some schema validation tests failed",
    results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(
        (r) =>
          typeof r === "object" &&
          r !== null &&
          "success" in r &&
          r.success === true
      ).length,
      failed: Object.values(results).filter(
        (r) =>
          typeof r === "object" &&
          r !== null &&
          "success" in r &&
          r.success === false
      ).length,
    },
  });
}

