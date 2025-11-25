import { NextResponse } from "next/server";
import { authenticateRequest, verifyClientOwnership } from "@/lib/api/middleware";
import { getWorkoutsByClientId } from "@/lib/db/queries/workouts";
import { getClientById } from "@/lib/db/queries/clients";

/**
 * GET /api/clients/[id]/workouts/history
 * Get workout history for a client
 * 
 * This endpoint returns all workouts for a client, ordered by date (most recent first).
 * Can be filtered by status query parameter.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest();
    
    // Verify client belongs to user
    await verifyClientOwnership(params.id, auth.userId);
    
    // Get optional status filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    // Get all workouts for the client
    let workouts = await getWorkoutsByClientId(params.id);
    
    // Filter by status if provided
    if (status) {
      workouts = workouts.filter((workout) => workout.status === status);
    }
    
    return NextResponse.json({
      workouts,
      count: workouts.length,
    });
  } catch (error) {
    console.error("Error fetching workout history:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Failed to fetch workout history",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

