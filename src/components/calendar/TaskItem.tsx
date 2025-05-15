import { Task, TaskStatus } from "@prisma/client";
import { FC, useState } from "react";
import { TaskStatusToggle } from "@/components/task/TaskStatusToggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useModal } from "@/components/modals";
import { If } from "@/lib/If";

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

  const { modal, openModal } = useModal("TaskEditModel");

  const openTaskEditModal = () => {
    openModal({
      id: task.id,
    });
  };

  const taskTitle = (
    <div onClick={openTaskEditModal} className={"cursor-pointer hover:underline shrink"}>
      {task.title}
    </div>
  );
  return (
    <div
      key={task.id}
      data-testid={`task-item`}
      className="group/task flex flex-col space-y-3 items-stretch overflow-visible w-full relative max-w-full"
    >
      {modal}
      <div
        className={"flex items-center relative group justify-start"}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <TaskStatusToggle
          className={"w-8 min-w-8"}
          status={task.status}
          onClick={() => {
            const idx = STATUS_ORDER.indexOf(task.status);
            const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
            onUpdateTaskStatus(task.id, next);
          }}
        />
        {taskTitle}
        <If condition={task.status !== "COMPLETED" && isHovering}>
          <div className="group-hover:flex">
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
        </If>
      </div>
    </div>
  );
};
