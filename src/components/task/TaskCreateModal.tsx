import { ModalProps } from "@/components/modals";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FC, useCallback } from "react";
import "react-time-picker/dist/TimePicker.css";
import { TaskForm, TaskFormType } from "@/components/task/TaskForm";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { useInvalidateGrid } from "@/hooks/useInvalidateGrid";

type TaskEditModelProps = ModalProps & {
  initialDate: Date;
  initialDuration: number;
};

export const TaskCreateModel: FC<TaskEditModelProps> = ({
  open,
  onOpenChange,
  initialDuration,
  initialDate,
}) => {
  const invalidate = useInvalidateGrid();
  const onCreate = useCallback(
    async (data: TaskFormType) => {
      await client.authed.createMyTask(data.targetId, data.title, data.date, data.taskDuration);
      await invalidate();
      onOpenChange(false);
      toast("Task created successfully");
    },
    [invalidate, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          initial={{
            duration: initialDuration,
            date: initialDate,
          }}
          onSubmit={onCreate}
        />
      </DialogContent>
    </Dialog>
  );
};
