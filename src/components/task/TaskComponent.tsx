import { FC } from "react";
import { TaskEditItem } from "@/components/task/TaskEditItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {useState} from "react";
import { FormLabel } from "@/components/ui/form";
import { TaskDraft } from "./TaskDraft";
import { TaskStatus } from "./TaskDraft";



interface TaskComponentProps {
    tasks: TaskDraft[];
    onAdd: (title: string) => void;
    onUpdateTitle: (taskId: string, title: string) => void;
    onUpdateStatus: (taskId: string, status: TaskStatus) => void;
    onDelete: (id: string) => void;
}


export const TaskComponent: FC<TaskComponentProps> = ({tasks, onAdd, onDelete, onUpdateTitle, onUpdateStatus}) => {
    const [addMode, setAddMode] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const hasTasks = tasks.length > 0;

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && newTitle.trim()) {
          e.preventDefault();
          await onAdd(newTitle.trim());
          setNewTitle("");
          setAddMode(false);
        }
        if (e.key === "Escape") {
          setNewTitle("");
          setAddMode(false);
        }
      };

    return (
        <div>
            <div>
              <FormLabel>Your Tasks</FormLabel>
            </div>
            {hasTasks && (
            <div className="space-y-3 flex flex-col items-stretch">
                {tasks.map((task) => (
                <TaskEditItem key={task.id} task={task} onDelete={onDelete} onUpdateTitle={onUpdateTitle} onUpdateTaskStatus={onUpdateStatus} />
                ))}
            </div>
            )}
            <div className="h-6" />
            {addMode ? (
                    <Input
                    autoFocus
                    placeholder="Enter new task"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setNewTitle("");
                        setAddMode(false);
                    }}
                    />
            ) : (
                <Button
                variant="default"
                className="w-full"
                onClick={() => setAddMode(true)}
                >
                <span>Add Task</span>
                </Button>
            )}
        </div>
    );
}