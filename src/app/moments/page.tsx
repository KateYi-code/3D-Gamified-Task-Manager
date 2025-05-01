"use client";

import { useAuth } from "@/providers/auth-provider";

export default function MomentsPage() {
  const { user, loading } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Moments</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder content for moments page */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <div className="w-full h-40 bg-gray-200 rounded-md mb-3"></div>
                <h3 className="text-lg font-medium text-gray-800">Moment Title {item}</h3>
                <p className="text-gray-600 text-sm mt-1">This is a placeholder for a moment card.</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">2 hours ago</span>
                  <button className="text-blue-600 text-sm hover:text-blue-800">View Details</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Moments Timeline</h2>
            <p className="text-gray-600 mb-4">Please log in to see your moments timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}