import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Validate request data against a Zod schema
 * Returns parsed data or throws an error
 */
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Safely validate request data against a Zod schema
 * Returns a result object with success flag and data/error
 */
export function safeValidateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Create an error response for validation failures
 */
export function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    },
    { status: 400 }
  );
}

/**
 * Validate JSON body from request
 */
export async function validateRequestBody<T extends z.ZodType>(
  schema: T,
  request: Request
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json();
    const result = safeValidateSchema(schema, body);

    if (!result.success) {
      return {
        success: false,
        response: validationErrorResponse(result.error),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters from request
 */
export function validateQueryParams<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  // Convert URLSearchParams or Record to plain object
  const params: Record<string, unknown> = {};
  
  if (searchParams instanceof URLSearchParams) {
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  } else {
    Object.assign(params, searchParams);
  }

  return safeValidateSchema(schema, params);
}

