import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SPOTTER",
  description: "Sign in to your SPOTTER account",
};

/**
 * Auth Layout
 * 
 * Layout for authentication pages (sign-in, sign-up).
 * Provides a clean, centered layout for auth flows.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}

