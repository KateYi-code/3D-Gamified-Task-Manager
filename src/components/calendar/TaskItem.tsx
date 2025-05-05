import { Task } from "@prisma/client";
import { FC } from "react";
import { IoIosCheckmarkCircle, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { Button } from "@/components/ui/button";

interface Props {
  task: Task;
}

export const TaskItem: FC<Props> = ({ task }) => {
  // TODO: Add start task. @Kate
  const onStartTask = () => {};

  return (
    <div key={task.id} className="group/task flex flex-col items-stretch gap-1">
      <div className={"flex items-center gap-1"}>
        {task.status === "COMPLETED" ? (
          <IoIosCheckmarkCircle className="w-5 h-5" />
        ) : (
          <IoIosCheckmarkCircleOutline className="text-gray-400 w-5 h-5" />
        )}
        <span>{task.title}</span>
      </div>

      {task.status !== "COMPLETED" && (
        <div
          className={
            "group-hover/task:h-10 h-0 transition-all duration-500 overflow-hidden flex items-center"
          }
        >
          <Button onClick={onStartTask} variant="default" className={"w-full"} size="sm">
            <span className="text-sm">Start Task</span>
          </Button>
        </div>
      )}
    </div>
  );
};
