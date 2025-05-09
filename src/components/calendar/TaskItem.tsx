import { Task , TaskStatus} from "@prisma/client";
import { FC } from "react";
import { TaskStatusToggle } from "@/components/task/TaskStatusToggle";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { useState , useEffect} from "react";

interface Props {
  task: Task;
  onUpdate: () => void;
}

const STATUS_ORDER: TaskStatus[] = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
  ];

export const TaskItem: FC<Props> = ({ task , onUpdate}) => {
  const [isHovering, setIsHovering] = useState(false);

  const onStartTask = () => {
      // TODO: Add start task. @Kate
  };

  const [LocalTask, setLocalStatus] = useState(task);
  useEffect(() => {
    if (LocalTask.status !== task.status) {
      //toast.error("Task status update failed.");
      setLocalStatus(task);
    }
  }, [task]);

  const onUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setLocalStatus((prev) => ({ ...prev, status }));
    await client.authed.updateMyTaskStatus(taskId, status);
    onUpdate();
    toast("task status updated successfully");
  };
  

  return (
    <div key={task.id} className="group/task flex flex-col items-stretch gap-1">
      <div className={"flex items-center gap-1"}>
        <TaskStatusToggle
            status={LocalTask.status}
            onClick={() => {
               const idx = STATUS_ORDER.indexOf(LocalTask.status);
               const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
               onUpdateTaskStatus(LocalTask.id, next);
              }}
        />
        {LocalTask.status === "COMPLETED"
              ? 
              <span>{LocalTask.title}</span>                 
              : 
              <button onClick={onStartTask}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="w-full text-left">
                  {isHovering
                      ? 'Start Task'                  
                      : LocalTask.title       
                  }
              </button>
        }
      </div>

    </div>
  );
};

