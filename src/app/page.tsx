"use client";

import { UserList } from "@/components/UserList";
import { useAuth } from "@/providers/auth-provider";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : user ? (
          <UserList />
        ) : (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Planet</h2>
            <p className="text-gray-600 mb-4">Please log in to see the dashboard content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
