import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-4xl font-bold">SPOTTER</h1>
      <p className="mb-8 text-lg text-gray-600">
        Personal Trainer Management System
      </p>

      {userId ? (
        <div className="space-y-4 text-center">
          <p className="text-green-600">✅ You are authenticated!</p>
          <p className="text-sm text-gray-500">User ID: {userId}</p>
          <Link
            href="/dashboard"
            className="inline-block rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-gray-600">You are not authenticated</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-in"
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
