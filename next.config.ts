import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // PWA support configuration
  // Note: Full PWA manifest and service worker setup will be added in later phases
  
  // Proxy configuration for Next.js 16
  // Clerk handles authentication routes automatically via ClerkProvider
  // All /api/auth/* routes are proxied by Clerk SDK internally
  // Minimal middleware.ts exists only to provide auth() context - actual routing uses proxy mode
  async rewrites() {
    return [
      // ClerkProvider automatically handles /api/auth/* route proxying
      // No manual rewrites needed for Clerk authentication
    ];
  },
};

export default nextConfig;
