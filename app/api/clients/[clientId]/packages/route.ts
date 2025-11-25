import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getClientById } from "@/lib/db/queries/clients";
import { createPackage, getPackagesByClientId } from "@/lib/db/queries/packages";
import { enforcePackageLimit } from "@/lib/subscriptions/enforce-limits";
import { createPackageSchema } from "@/lib/schemas/package";

/**
 * GET /api/clients/[clientId]/packages
 * Get all packages for a client
 */
export async function GET(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const clerkUserId = await getCurrentUserId();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserByClerkId(clerkUserId);
    const client = await getClientById(params.clientId);

    // Verify client belongs to user
    if (client.trainer_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: Client does not belong to you" },
        { status: 403 }
      );
    }

    const packages = await getPackagesByClientId(params.clientId);

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch packages",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients/[clientId]/packages
 * Create a new package for a client with subscription limit enforcement
 */
export async function POST(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const clerkUserId = await getCurrentUserId();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Enforce subscription limits before creating
    await enforcePackageLimit(params.clientId);

    const body = await request.json();
    const validatedData = createPackageSchema.parse({
      ...body,
      client_id: params.clientId,
    });

    const packageData = await createPackage({
      client_id: validatedData.client_id,
      total_sessions: validatedData.total_sessions,
      remaining_sessions: validatedData.total_sessions,
      expiration_date: validatedData.expiration_date ?? null,
      is_active: true,
    });

    return NextResponse.json({ package: packageData }, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);

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
        error: "Failed to create package",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

