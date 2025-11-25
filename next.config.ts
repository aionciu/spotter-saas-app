import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // PWA support configuration
  // Note: Full PWA manifest and service worker setup will be added in later phases
  
  // Proxy configuration for Next.js 16
  // Clerk handles authentication routes automatically via ClerkProvider
  // All /api/auth/* routes are proxied by Clerk SDK internally
  async rewrites() {
    return [
      // Clerk handles auth routes automatically, no manual proxy needed
      // The ClerkProvider in app/layout.tsx sets up the proxy
    ];
  },
};

export default nextConfig;
