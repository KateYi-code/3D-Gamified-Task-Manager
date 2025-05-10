import { FC } from "react";
import { TaskEditItem } from "@/components/task/TaskEditItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {useState} from "react";
import { FormLabel } from "@/components/ui/form";
import { TaskDraft } from "./TaskDraft";
import { TaskStatus } from "./TaskDraft";
import { IoIosRadioButtonOff } from "react-icons/io";



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
    const iconProps = {
      size: 20,
      className: "cursor-pointer",
    };
  

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
        <div className="space-y-3 flex flex-col items-stretch overflow-visible">
            <div>
              <FormLabel className="relative h-6">Your Tasks</FormLabel>
            </div>
            {hasTasks && (
            <div className="space-y-3 flex flex-col items-stretch">
                {tasks.map((task) => (
                <TaskEditItem key={task.id} task={task} onDelete={onDelete} onUpdateTitle={onUpdateTitle} onUpdateTaskStatus={onUpdateStatus} />
                ))}
            </div>
            )}
            <div className="
                relative       
                h-6          
                flex items-center 
                gap-1              
                overflow-visible  
            ">
              <IoIosRadioButtonOff {...iconProps} color="green" />
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
                      className="flex-1"
                      />
              ) : (
                  <div>
                    <Button
                    variant="default"
                    className="H-full flex-1"
                    onClick={() => setAddMode(true)}
                    >
                    <span>Add Task</span>
                    </Button>
                  </div>
              )}
            </div>
        </div>
    );
}