"use client";

import { TaskTimerDialog } from "@/components/task/TaskTimerDialog";
import { useParams } from "next/navigation";

export default function TimerDialogPage() {
    const { id } = useParams(); // 获取动态路由参数
    return <TaskTimerDialog taskId={id as string} />;
}