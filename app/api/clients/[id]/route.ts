import { NextResponse } from "next/server";
import { authenticateRequest, verifyClientOwnership } from "@/lib/api/middleware";
import { getClientById, updateClient, deleteClient } from "@/lib/db/queries/clients";
import { updateClientSchema } from "@/lib/schemas/client";

/**
 * GET /api/clients/[id]
 * Get a specific client by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest();
    
    const client = await getClientById(id);
    
    // Verify client belongs to user
    await verifyClientOwnership(id, auth.userId);
    
    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error fetching client:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Failed to fetch client",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Update a client
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest();
    
    // Verify client belongs to user
    await verifyClientOwnership(id, auth.userId);
    
    const body = await request.json();
    const validatedData = updateClientSchema.parse(body);
    
    const client = await updateClient(id, {
      name: validatedData.name,
      gender: validatedData.gender ?? null,
      notes: validatedData.notes ?? null,
    });
    
    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error updating client:", error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    // Handle authorization errors
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Failed to update client",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Delete a client
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest();
    
    // Verify client belongs to user
    await verifyClientOwnership(id, auth.userId);
    
    await deleteClient(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Failed to delete client",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

