import { FC } from "react";
import { TaskDraft , TaskStatus } from "./TaskDraft";
import { TaskStatusToggle } from "./TaskStatusToggle";
import { useModal } from "@/components/modals";
import { FaRegEdit } from "react-icons/fa";

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

export const TaskEditItem: FC<TaskEditItemProps> = ({ task, onUpdateTaskStatus, onDelete}) => {
    const { modal: taskEditModal, openModal, open } = useModal("TaskEditModel");
    
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
                <div className="flex items-center gap-2 justify-end">
                    <button
                        type="button"
                        onClick={() => {
                        openModal({
                            task: task,
                        });
                        }}
                        className="text-primary hover:bg-accent p-1 rounded cursor-pointer ml-auto"
                        >
                        <FaRegEdit size={20} />
                    </button>
                    <span className="inline-block px-2 py-1 text-sm invisible">Delete</span>
                </div>
                    <button
                    onClick={() => onDelete(task.id)}
                    className="absolute right-0 px-2 py-1 bg-[var(--destructive)] text-[var(--primary-foreground)] rounded-[var(--radius-sm)] text-sm"
                    >
                    Delete
                    </button>
                {open && (taskEditModal)}
            </div>
        </div>
    );
};

