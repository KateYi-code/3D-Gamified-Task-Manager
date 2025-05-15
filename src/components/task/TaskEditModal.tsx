import { ModalProps } from "@/components/modals";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FC, useCallback } from "react";
import "react-time-picker/dist/TimePicker.css";
import { TaskForm, TaskFormType } from "@/components/task/TaskForm";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { useInvalidateQuery, useQuery } from "@/hooks/useQuery";
import { useInvalidateGrid } from "@/hooks/useInvalidateGrid";

type TaskEditModelProps = ModalProps & {
  id: string;
};

export const TaskEditModel: FC<TaskEditModelProps> = ({ open, onOpenChange, id }) => {
  const { data: task } = useQuery("getMyTaskById", id);
  const invalidate = useInvalidateGrid();
  const invalidateQuery = useInvalidateQuery();
  const onSave = useCallback(
    async (data: TaskFormType) => {
      await client.authed.updateMyTask({
        id,
        title: data.title,
        duration: data.taskDuration,
        date: data.date,
        targetId: data.targetId,
      });
      await invalidate();
      await invalidateQuery("getMyTaskById", id);
      onOpenChange(false);
      toast("Task update successfully");
    },
    [id, invalidate, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        {task && (
          <TaskForm
            initial={{
              duration: task?.taskDuration,
              date: task?.date,
              title: task?.title,
              targetId: task?.targetId,
            }}
            onSubmit={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
