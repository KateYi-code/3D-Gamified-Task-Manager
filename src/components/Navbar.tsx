"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Prototype
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : user ? (
              <>
                <span className="text-gray-700 mr-2">Hello, {user.name || user.email}</span>
                <button
                  onClick={() => logout()}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
