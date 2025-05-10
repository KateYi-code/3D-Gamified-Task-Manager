import { FC } from "react";
import { TaskDraft , TaskStatus } from "./TaskDraft";
import { TaskStatusToggle } from "./TaskStatusToggle";

interface TaskEditItemProps {
    task: TaskDraft;
    onUpdateTitle: (taskId: string, title: string) => void;
    onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
    onDelete: (taskId: string) => void;
}

const STATUS_ORDER: TaskStatus[] = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
  ];

export const TaskEditItem: FC<TaskEditItemProps> = ({ task, onUpdateTaskStatus}) => {
    return (
        <div key={task.id} className="group/task flex flex-col items-stretch w-full relative h-6">
            <div className="flex items-center gap-1">
                <TaskStatusToggle
                    status={task.status}
                    onClick={() => {
                        const idx = STATUS_ORDER.indexOf(task.status);
                        const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
                        onUpdateTaskStatus(task.id, next);
                    }}
                />
                <span>{task.title}</span>
            </div>
        </div>
    );
};

