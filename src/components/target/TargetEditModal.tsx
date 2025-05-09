import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FC } from "react";
import { ModalProps, useModal } from "@/components/modals";
import { toast } from "sonner";
import { client } from "@/endpoints/client";
import { useInvalidateQuery, useQuery } from "@/hooks/useQuery";
import { TargetForm, TargetFormType } from "@/components/target/TargetForm";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "@prisma/client";
import { useEffect } from "react";
import { Task , Target } from "@prisma/client";

type Props = ModalProps & {
  targetId: string;
  tasks: Task[];
  target: Target;
};

export const TargetEditModal: FC<Props> = ({ open, onOpenChange, targetId, tasks}) => {
  const invalidate = useInvalidateQuery();
  const { data: target, refetch } = useQuery("getMyTargetById", targetId);
  const onSubmit = async (data: TargetFormType) => {
    await client.authed.updateMyTarget(targetId, data.title);
    await refetch();
    toast("Target updated successfully");
  };

  useEffect(() => {
    if (open && targetId) {
      refetch();
    }
  }, [open, targetId, refetch, tasks]);

  const onfinal = async() => {
    onOpenChange(false);
    await invalidate("getMyTargets");
  }

  const onAdd = async (targetid: string,title: string) => {
    await client.authed.createMyTask(targetid, title);
    await refetch();
    toast("Task updated successfully");
  }

  const onDelete = async (taskId: string) => {
    await client.authed.deleteMyTask(taskId);
    await refetch();
    toast("Task deleted successfully");
  };
  const onUpdateTitle = async (taskId: string, title: string) => {
    await client.authed.updateMyTaskTitle(taskId, title);
    await refetch();
    toast("Task title updated successfully");
  };
  
  const onUpdateStatus = async (taskId: string, status: TaskStatus) => {
    await client.authed.updateMyTaskStatus(taskId, status);
    await refetch();
    toast("Task status updated successfully");
  };

  const { modal, openModal } = useModal("Confirm");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Target</DialogTitle>
        </DialogHeader>
        {target && <TargetForm  onSubmit={onSubmit} 
                                initialValues={target} 
                                Tasks={target.tasks} 
                                onAdd={onAdd} 
                                onDelete={onDelete} 
                                onUpdateTitle={onUpdateTitle} 
                                Id={targetId} 
                                onUpdateStatus={onUpdateStatus }
                                onfinal={onfinal}/>}
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
