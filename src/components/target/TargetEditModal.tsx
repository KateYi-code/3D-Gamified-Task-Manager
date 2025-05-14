import { FC, useEffect, useState } from "react";
import { ModalProps, useModal } from "@/components/modals";
import { toast } from "sonner";
import { client } from "@/endpoints/client";
import { useInvalidateQuery, useQuery } from "@/hooks/useQuery";
import { TargetForm, TargetFormType } from "@/components/target/TargetForm";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "@prisma/client";
import { Task, Target } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type Props = ModalProps & {
  targetId: string;
  tasks: Task[];
  target: Target;
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  LocalTasks: Task[];
};

export const TargetEditModal: FC<Props> = ({
  open,
  onOpenChange,
  targetId,
  setUpdate,
  LocalTasks,
}) => {
  const [trigger, setTrigger] = useState(false);
  useEffect(() => {
    if (trigger) {
      setTrigger(true);
    }
  }, [trigger]);
  const invalidate = useInvalidateQuery();
  const { data: target, refetch } = useQuery("getMyTargetById", targetId);

  // State to track task completion
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);

  // Check if all tasks are completed
  const checkAllTasksCompleted = (tasks: Task[]) => {
    const allCompleted = tasks.every((task) => task.status === "COMPLETED");
    setAllTasksCompleted(allCompleted);
  };

  const onSubmit = async (data: TargetFormType) => {
    await client.authed.updateMyTarget(targetId, data.title);
    await refetch();
    toast("Target updated successfully");
  };

  useEffect(() => {
    if (open && targetId) {
      refetch();
    }
  }, [open, targetId, refetch]);

  useEffect(() => {
    if (LocalTasks.length > 0) {
      checkAllTasksCompleted(LocalTasks);
    }
  }, [LocalTasks]);

  const onfinal = async () => {
    onOpenChange(false);
    await invalidate("getMyTargets");
    setUpdate(true);
  };

  const onAdd = async (targetid: string, title: string) => {
    await client.authed.createMyTask(targetid, title);
  };

  const onDelete = async (taskId: string) => {
    await client.authed.deleteMyTask(taskId);
  };

  const onUpdateTitle = async (taskId: string, title: string) => {
    await client.authed.updateMyTaskTitle(taskId, title);
  };

  const onUpdateStatus = async (taskId: string, status: TaskStatus) => {
    await client.authed.updateMyTaskStatus(taskId, status);
  };

  // If all tasks are completed, show a toast message
  useEffect(() => {
    if (allTasksCompleted) {
      toast.success("🎉 All tasks completed! Please place the reward on the planet!");
      onfinal(); // Optionally, finalize once all tasks are complete
    }
  }, [allTasksCompleted, onfinal]);

  const { modal, openModal } = useModal("Confirm");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Target</DialogTitle>
        </DialogHeader>
        {target && (
          <TargetForm
            onSubmit={onSubmit}
            initialValues={target}
            Tasks={LocalTasks}
            onAdd={onAdd}
            onDelete={onDelete}
            onUpdateTitle={onUpdateTitle}
            Id={targetId}
            onUpdateStatus={onUpdateStatus}
            onfinal={onfinal}
            setTrigger={setTrigger}
          />
        )}
        <Button
          onClick={() => {
            openModal({
              title: "Delete Target",
              description: "Are you sure you want to delete this target?",
              onConfirm: async () => {
                await client.authed.deleteMyTarget(targetId);
                onOpenChange(false);
                await invalidate("getMyTargets");
                toast("Target deleted successfully");
              },
            });
          }}
          variant={"destructive"}
        >
          <span>Delete</span>
        </Button>
        {modal}
      </DialogContent>
    </Dialog>
  );
};
