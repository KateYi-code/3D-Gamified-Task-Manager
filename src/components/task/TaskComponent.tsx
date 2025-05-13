import { TaskEditItem } from "@/components/task/TaskEditItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { TaskDraft } from "./TaskDraft";
import { TaskStatus } from "./TaskDraft";
import { IoIosRadioButtonOff } from "react-icons/io";
import { useForm } from "react-hook-form";
import { useImperativeHandle, forwardRef } from "react";

export type TaskComponentHandle = {
  submitTaskInput: () => void;
};

type FormInput = {
  task: string;
};

interface TaskComponentProps {
  tasks: TaskDraft[];
  onAdd: (title: string) => void;
  onUpdateTitle: (taskId: string, title: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export const TaskComponent = forwardRef<
  TaskComponentHandle,
  TaskComponentProps
>((props, ref) => {
  const { tasks, onAdd, onDelete, onUpdateTitle, onUpdateStatus } = props;
  const { register, getValues, setValue } = useForm<FormInput>();
  const hasTasks = tasks.length > 0;
  const iconProps = {
    size: 20,
    className: "cursor-pointer",
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const value = getValues("task")?.trim();
    if (value) {
      onAdd(value);
      setValue("task", "");
    }
  };

  const getValue = () => {
    const value = getValues("task")?.trim();
    return value;
    setValue("task", "");
  }
  useImperativeHandle(ref, () => ({
    submitTaskInput: getValue
  }), [getValue]);

  return (
    <div className="space-y-3 flex flex-col items-stretch overflow-visible">
      <div>
        <FormLabel className="relative h-6">Your Tasks</FormLabel>
      </div>
      {hasTasks && (
        <div className="space-y-3 flex flex-col items-stretch">
          {tasks.map((task) => (
            <TaskEditItem
              key={task.id}
              task={task}
              onDelete={onDelete}
              onUpdateTitle={onUpdateTitle}
              onUpdateTaskStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 w-full h-full">
        <IoIosRadioButtonOff {...iconProps} color="green" />
        <Input
          {...register("task")}
          autoFocus
          placeholder="Enter new task"
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button  type="button" variant="default" className="h-full" onClick={handleSubmit}>
          <span>Add Task</span>
        </Button>
      </div>
    </div>
  );
});

TaskComponent.displayName = "TaskComponent";