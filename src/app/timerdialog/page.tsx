"use client";

import { TaskTimerDialog } from "@/components/task/TaskTimerDialog";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export default function TimerDialogPage() {
  const pathname = usePathname();
  // 从路径中提取taskId（假设路径格式为 /timerdialog/[taskId]）
  const taskId = pathname.split("/").pop() || "";

  return (
    <Suspense>
      <TaskTimerDialog taskId={taskId} />
    </Suspense>
  );
}
