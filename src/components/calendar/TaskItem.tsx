import { Task, TaskStatus } from "@prisma/client";
import { FC, useState } from "react";
import { TaskStatusToggle } from "@/components/task/TaskStatusToggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  task: Task;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
}

const STATUS_ORDER: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export const TaskItem: FC<Props> = ({ task, onUpdateTaskStatus }) => {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const url = `/clock/${task.id}`;

  const onStartTask = (e: any) => {
    e.stopPropagation();
    onUpdateTaskStatus(task.id, "IN_PROGRESS").then(() => {
      router.push(url);
    });
  };

  return (
    <div
      key={task.id}
      data-testid={`task-item`}
      className="group/task flex flex-col space-y-3 items-stretch overflow-visible w-full relative h-6"
    >
      <div className={"flex items-center gap-1"}>
        <TaskStatusToggle
          status={task.status}
          onClick={() => {
            const idx = STATUS_ORDER.indexOf(task.status);
            const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
            onUpdateTaskStatus(task.id, next);
          }}
        />
        {task.status === "COMPLETED" ? (
          <span>{task.title}</span>
        ) : (
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex-1 min-w-0 relative overflow-visible"
          >
            <span className="block truncate">{task.title}</span>
            {isHovering && (
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size={"sm"}
                      variant="default"
                      className="absolute top-0 right-0"
                      onClick={onStartTask}
                    >
                      <FaPlay />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start Task</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
