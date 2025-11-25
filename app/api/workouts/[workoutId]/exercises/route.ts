import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getClientById } from "@/lib/db/queries/clients";
import { getWorkoutById, addExerciseToWorkout } from "@/lib/db/queries/workouts";
import { enforceExerciseLimit } from "@/lib/subscriptions/enforce-limits";
import { createExerciseSchema } from "@/lib/schemas/workout";

/**
 * GET /api/workouts/[workoutId]/exercises
 * Get all exercises for a workout
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params;
    const clerkUserId = await getCurrentUserId();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserByClerkId(clerkUserId);
    const workout = await getWorkoutById(workoutId);
    const client = await getClientById(workout.client_id);

    // Verify workout belongs to user's client
    if (client.trainer_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: Workout does not belong to you" },
        { status: 403 }
      );
    }

    return NextResponse.json({ exercises: workout.exercises || [] });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch exercises",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workouts/[workoutId]/exercises
 * Add a new exercise to a workout with subscription limit enforcement
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params;
    const clerkUserId = await getCurrentUserId();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Enforce subscription limits before creating
    await enforceExerciseLimit(workoutId);

    const body = await request.json();
    const validatedData = createExerciseSchema.parse({
      ...body,
      workout_id: workoutId,
    });

    // Get workout to determine order_index
    const workout = await getWorkoutById(workoutId);
    const currentExercises = workout.exercises || [];
    const maxOrderIndex = currentExercises.length > 0
      ? Math.max(...currentExercises.map((e: { order_index: number }) => e.order_index || 0))
      : -1;

    const exercise = await addExerciseToWorkout({
      workout_id: validatedData.workout_id,
      exercise_name: validatedData.exercise_name,
      sets: validatedData.sets,
      reps: validatedData.reps ?? null,
      weight: validatedData.weight ?? null,
      order_index: maxOrderIndex + 1,
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    // Handle subscription limit errors
    if (error instanceof Error && error.message.includes("limit")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create exercise",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

