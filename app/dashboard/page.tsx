import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-4xl font-bold">Dashboard</h1>
      <p className="mb-4 text-lg text-gray-600">
        Welcome! You are successfully authenticated.
      </p>
      <p className="mb-8 text-sm text-gray-500">User ID: {userId}</p>
      
      <div className="space-y-2">
        <Link
          href="/"
          className="block rounded bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 text-center"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

