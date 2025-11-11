"use client";

import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="mb-4 text-lg">Not logged in.</p>
        <a
          href="/login"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-semibold">
        Welcome, {session.user?.name} 👋
      </h1>
      <button
        onClick={() => signOut()}
        className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
      >
        Sign Out
      </button>
    </div>
  );
}
