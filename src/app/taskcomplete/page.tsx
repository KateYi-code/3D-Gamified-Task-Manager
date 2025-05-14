"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function TaskCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formattedTime, setFormattedTime] = useState("");
  const taskId = searchParams.get("taskId");

  useEffect(() => {
    const duration = Number(searchParams.get("duration"));
    if (!isNaN(duration)) {
      const minutes = Math.floor(duration / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (duration % 60).toString().padStart(2, "0");
      setFormattedTime(`${minutes}:${seconds}`);
    }
  }, [searchParams]);

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-200 text-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold text-purple-600">🎉 Task Completed!</h1>
        <p className="text-gray-700">
          You’ve just finished a session with{" "}
          <span className="font-semibold text-blue-500">{formattedTime}</span> of deep work.
        </p>
        <p className="text-sm text-gray-500">
          Your achievement has been shared to the community. Keep it up!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition-all"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push("/tasklog")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-full transition-all"
          >
            View Task Log
          </button>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <button
            onClick={() => {
              if (taskId) {
                router.push(`/planet?finished=${taskId}`);
              } else {
                alert("Missing task ID");
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full transition-all"
          >
            Add Bonus to My Planet
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TaskCompletePageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskCompletePage />
    </Suspense>
  );
}
