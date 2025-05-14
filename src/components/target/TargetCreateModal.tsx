import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FC } from "react";
import type { ModalProps } from "@/components/modals";
import { client } from "@/endpoints/client";
import { useInvalidateQuery } from "@/hooks/useQuery";
import { TargetForm, TargetFormType } from "@/components/target/TargetForm";
import { TaskStatus } from "@prisma/client";
import { useState } from "react";
import { useEffect } from "react";

type Props = ModalProps & {
  targetDate: Date;
};

export const TargetCreateModal: FC<Props> = ({ open, onOpenChange, targetDate }) => {
  const [trigger, setTrigger] = useState(false);
  useEffect(() => {
    if (trigger) {
      setTrigger(true);
    }
  }, [trigger]);
  const [newTargetId, setNewTargetId] = useState<string>(" ");
  const onAdd = async (targetId: string, title: string): Promise<void> => {
    await client.authed.createMyTask(targetId, title);
  };
  const onDelete = async (taskId: string): Promise<void> => {
    await client.authed.deleteMyTask(taskId);
  };
  const onUpdateStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    await client.authed.updateMyTaskStatus(taskId, status);
  };
  const onUpdateTitle = async (taskId: string, title: string): Promise<void> => {
    await client.authed.updateMyTaskTitle(taskId, title);
  };

  const invalidate = useInvalidateQuery();
  const onSubmit = async (data: TargetFormType) => {
    const newTarget = await client.authed.createMyTarget(data.title, targetDate);
    setNewTargetId(newTarget.id);
  };

  const onfinal = async () => {
    onOpenChange(false);
    await invalidate("getMyTargets");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="target-create-modal">
        <DialogHeader>
          <DialogTitle>Create Target</DialogTitle>
        </DialogHeader>
        <TargetForm
          onSubmit={onSubmit}
          initialValues={{ title: "" }}
          Tasks={[]}
          onAdd={onAdd}
          onDelete={onDelete}
          onUpdateTitle={onUpdateTitle}
          Id={newTargetId}
          onUpdateStatus={onUpdateStatus}
          onfinal={onfinal}
          targetDate={targetDate}
          setTrigger={setTrigger}
        />
      </DialogContent>
    </Dialog>
  );
};
