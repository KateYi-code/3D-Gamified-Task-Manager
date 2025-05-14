// app/countdownclock/[taskId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CountDownClock } from "@/components/task/CountDownClock";

export default function CountdownClockPage() {
  const { id: taskId } = useParams();
  const searchParams = useSearchParams();
  const [initialMinutes, setInitialMinutes] = useState<number | null>(null);
  const [initialSeconds, setInitialSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      setError("Missing start or end time.");
      return;
    }

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = Math.floor((endTime - startTime) / 1000); // in seconds

    if (isNaN(duration) || duration <= 0) {
      setError("Invalid duration.");
      return;
    }

    setInitialMinutes(Math.floor(duration / 60));
    setInitialSeconds(duration % 60);
  }, [searchParams]);

  if (error) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        <h2>⚠️ Error:</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (initialMinutes === null) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold text-center">Countdown for Task: {taskId}</h1>
      <CountDownClock
        initialMinutes={initialMinutes}
        initialSeconds={initialSeconds}
        onComplete={() => {
          console.log("Task complete!");
        }}
      />
    </div>
  );
}
