"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const CountdownClock = () => {
  const params = useSearchParams();
  const taskId = params.get("taskId");
  const start = params.get("start");
  const end = params.get("end");

  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    if (!start || !end) return;

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const now = Date.now();

    if (now < startTime) {
      const untilStart = startTime - now;
      setRemainingTime(untilStart / 1000); // in seconds

      const timer = setTimeout(() => {
        const duration = (endTime - startTime) / 1000;
        setRemainingTime(duration);
      }, untilStart);

      return () => clearTimeout(timer);
    } else {
      const remaining = (endTime - now) / 1000;
      setRemainingTime(Math.max(remaining, 0));
    }
  }, [start, end]);

  useEffect(() => {
    if (remainingTime === null) return;
    const interval = setInterval(() => {
      setRemainingTime((t) => (t !== null ? Math.max(t - 1, 0) : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-2xl font-bold">Countdown for Task {taskId}</h1>
      {remainingTime !== null ? (
        <p className="text-5xl font-mono">{Math.floor(remainingTime)}s</p>
      ) : (
        <p>Loading countdown...</p>
      )}
    </div>
  );
};
export default function CountdownClockPage() {
  return (
    <Suspense>
      <CountdownClock />
    </Suspense>
  );
}
