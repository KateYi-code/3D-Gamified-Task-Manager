import { Task , TaskStatus} from "@prisma/client";
import { FC } from "react";
import { TaskStatusToggle } from "@/components/task/TaskStatusToggle";
import { useState ,} from "react";

interface Props {
  task: Task;
  onUpdate: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
}

const STATUS_ORDER: TaskStatus[] = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
  ];

export const TaskItem: FC<Props> = ({ task, onUpdateTaskStatus}) => {
  const [isHovering, setIsHovering] = useState(false);

  const onStartTask = () => {
      // TODO: Add start task. @Kate
  };
  

  return (
    <div key={task.id} className="group/task flex flex-col items-stretch gap-1">
      <div className={"flex items-center gap-1"}>
        <TaskStatusToggle
            status={task.status}
            onClick={() => {
               const idx = STATUS_ORDER.indexOf(task.status);
               const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
               onUpdateTaskStatus(task.id, next);
              }}
        />
        {task.status === "COMPLETED"
              ? 
              <span>{task.title}</span>                 
              : 
              <div
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`w-full h-full`}
              >
                {!isHovering ? (
                  <span>{task.title}</span>
                ) : (
                  <button className="w-full h-full bg-primary text-primary-foreground text-sm font-medium rounded-md" onClick={onStartTask}>  
                    <span>Start Task</span>
                  </button>
                )}
              </div>
        }
      </div>

    </div>
  );
};

