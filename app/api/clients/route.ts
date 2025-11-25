import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { createClient, getClientsByTrainerId } from "@/lib/db/queries/clients";
import { enforceClientLimit } from "@/lib/subscriptions/enforce-limits";
import { createClientSchema } from "@/lib/schemas/client";
import type { CreateClientInput } from "@/lib/types/client";

/**
 * GET /api/clients
 * Get all clients for the current user
 */
export async function GET() {
  try {
    const clerkUserId = await getCurrentUserId();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserByClerkId(clerkUserId);
    const clients = await getClientsByTrainerId(user.id);

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch clients",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a new client with subscription limit enforcement
 */
export async function POST(request: Request) {
  try {
    const clerkUserId = await getCurrentUserId();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Enforce subscription limits before creating
    await enforceClientLimit();

    const body = await request.json();
    const validatedData = createClientSchema.parse(body);

    const user = await getUserByClerkId(clerkUserId);

    const client = await createClient({
      trainer_id: user.id,
      name: validatedData.name,
      gender: validatedData.gender ?? null,
      notes: validatedData.notes ?? null,
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);

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
        error: "Failed to create client",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

