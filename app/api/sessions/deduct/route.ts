import { NextResponse } from "next/server";
import { authenticateRequest, verifyPackageOwnership } from "@/lib/api/middleware";
import { deductSessionFromPackage, getPackageById } from "@/lib/db/queries/packages";
import { z } from "zod";

/**
 * Schema for deduct session request
 */
const deductSessionSchema = z.object({
  package_id: z.string().uuid("Invalid package ID"),
});

/**
 * POST /api/sessions/deduct
 * Deduct a session from a package
 * 
 * This endpoint deducts one session from a package's remaining_sessions count.
 * Used when a workout session is completed.
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest();
    
    const body = await request.json();
    const validatedData = deductSessionSchema.parse(body);
    
    // Verify package belongs to user
    await verifyPackageOwnership(validatedData.package_id, auth.userId);
    
    // Check if package has remaining sessions
    const packageData = await getPackageById(validatedData.package_id);
    
    if (packageData.remaining_sessions <= 0) {
      return NextResponse.json(
        { error: "No remaining sessions in package" },
        { status: 400 }
      );
    }
    
    if (!packageData.is_active) {
      return NextResponse.json(
        { error: "Package is not active" },
        { status: 400 }
      );
    }
    
    // Deduct the session
    const updatedPackage = await deductSessionFromPackage(validatedData.package_id);
    
    return NextResponse.json({
      package: updatedPackage,
      message: "Session deducted successfully",
    });
  } catch (error) {
    console.error("Error deducting session:", error);
    
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
        error: "Failed to deduct session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

