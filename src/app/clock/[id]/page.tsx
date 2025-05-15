// app/clock/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { client } from "@/endpoints/client";
import { Task } from "@prisma/client"; 
import { CountDownClock } from "@/components/task/CountDownClock";

export default function ClockPage() {
  const { id: taskId } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const freshTask = await client.authed.getMyTaskById(taskId as string);
        setTask(freshTask);
      } catch (err: any) {
        console.error(err);
        setError("❌ Failed to load task. It may not exist or you may not have permission.");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    } else {
      setError("❌ Task ID is missing from the URL.");
      setLoading(false);
    }
  }, [taskId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600 font-semibold">{error}</div>;
  if (!task) return null; 

  return (
    <div className="p-6 flex flex-col items-center space-y-6">
      <h4 className="mb-1 text-gray-700 font-bold">Ongoing Task: {task.title} </h4>
      <CountDownClock task={task} />
    </div>
);
}