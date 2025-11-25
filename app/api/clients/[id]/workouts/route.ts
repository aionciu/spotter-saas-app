import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getClientById } from "@/lib/db/queries/clients";
import { createWorkout, getWorkoutsByClientId } from "@/lib/db/queries/workouts";
import { enforceWorkoutLimit } from "@/lib/subscriptions/enforce-limits";
import { createWorkoutSchema } from "@/lib/schemas/workout";

/**
 * GET /api/clients/[id]/workouts
 * Get all workouts for a client
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    const clerkUserId = await getCurrentUserId();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserByClerkId(clerkUserId);
    const client = await getClientById(clientId);

    // Verify client belongs to user
    if (client.trainer_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: Client does not belong to you" },
        { status: 403 }
      );
    }

    const workouts = await getWorkoutsByClientId(clientId);

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch workouts",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients/[id]/workouts
 * Create a new workout for a client with subscription limit enforcement
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    const clerkUserId = await getCurrentUserId();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Enforce subscription limits before creating
    await enforceWorkoutLimit(clientId);

    const body = await request.json();
    const validatedData = createWorkoutSchema.parse({
      ...body,
      client_id: clientId,
    });

    const workout = await createWorkout({
      client_id: validatedData.client_id,
      name: validatedData.name,
      date: validatedData.date ? new Date(validatedData.date).toISOString() : new Date().toISOString(),
      status: validatedData.status || "planned",
    });

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);

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
        error: "Failed to create workout",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

