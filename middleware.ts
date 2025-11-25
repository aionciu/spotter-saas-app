import { clerkMiddleware } from "@clerk/nextjs/server";

// Minimal middleware for Clerk in Next.js 16
// Clerk requires this file to detect middleware usage
// Even though Next.js 16 prefers proxy, Clerk's auth() function needs this
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

