import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Custom error types for the application
 */

/**
 * API Error Response Structure
 */
export interface ApiErrorResponse {
  error: string;
  details?: string | Array<{ path: string; message: string }>;
  code?: string;
}

/**
 * Standardized error codes
 */
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  SUBSCRIPTION_LIMIT = "SUBSCRIPTION_LIMIT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: ErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): NextResponse<ApiErrorResponse> {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: "Validation failed",
        code: ErrorCode.VALIDATION_ERROR,
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: error.message,
        code: error.code,
        details: error.details as string | undefined,
      },
      { status: error.statusCode }
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: error.message || "Unauthorized",
          code: ErrorCode.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    if (error.message.includes("limit")) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: error.message,
          code: ErrorCode.SUBSCRIPTION_LIMIT,
        },
        { status: 403 }
      );
    }

    if (error.message.includes("not found") || error.message.includes("does not exist")) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: error.message || "Resource not found",
          code: ErrorCode.NOT_FOUND,
        },
        { status: 404 }
      );
    }

    // Generic error
    return NextResponse.json<ApiErrorResponse>(
      {
        error: error.message || defaultMessage,
        code: ErrorCode.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  return NextResponse.json<ApiErrorResponse>(
    {
      error: defaultMessage,
      code: ErrorCode.INTERNAL_ERROR,
      details: String(error),
    },
    { status: 500 }
  );
}

/**
 * Helper functions for common error responses
 */
export const ErrorResponses = {
  unauthorized: (message: string = "Unauthorized") =>
    NextResponse.json<ApiErrorResponse>(
      {
        error: message,
        code: ErrorCode.UNAUTHORIZED,
      },
      { status: 401 }
    ),

  forbidden: (message: string = "Forbidden") =>
    NextResponse.json<ApiErrorResponse>(
      {
        error: message,
        code: ErrorCode.FORBIDDEN,
      },
      { status: 403 }
    ),

  notFound: (resource: string = "Resource") =>
    NextResponse.json<ApiErrorResponse>(
      {
        error: `${resource} not found`,
        code: ErrorCode.NOT_FOUND,
      },
      { status: 404 }
    ),

  badRequest: (message: string = "Bad request") =>
    NextResponse.json<ApiErrorResponse>(
      {
        error: message,
        code: ErrorCode.BAD_REQUEST,
      },
      { status: 400 }
    ),

  subscriptionLimit: (message: string) =>
    NextResponse.json<ApiErrorResponse>(
      {
        error: message,
        code: ErrorCode.SUBSCRIPTION_LIMIT,
      },
      { status: 403 }
    ),

  internalError: (message: string = "Internal server error") =>
    NextResponse.json<ApiErrorResponse>(
      {
        error: message,
        code: ErrorCode.INTERNAL_ERROR,
      },
      { status: 500 }
    ),
};

