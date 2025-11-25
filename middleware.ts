import { clerkMiddleware } from "@clerk/nextjs/server";

// Minimal middleware required for Clerk's auth() function to work
// This middleware provides the authentication context for server components and API routes
// Actual route protection is handled via proxy mode and server-side checks
export default clerkMiddleware();

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    // This ensures auth() works everywhere it's called
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

