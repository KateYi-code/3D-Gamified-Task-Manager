import { FC, useEffect, useState } from "react";
import { ModalProps, useModal } from "@/components/modals";
import { toast } from "sonner";
import { client } from "@/endpoints/client";
import { useQuery } from "@/hooks/useQuery";
import { TargetForm, TargetFormType } from "@/components/target/TargetForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useInvalidateGrid } from "@/hooks/useInvalidateGrid";

type Props = ModalProps & {
  targetId: string;
};

export const TargetEditModal: FC<Props> = ({ open, onOpenChange, targetId }) => {
  const [trigger, setTrigger] = useState(false);
  useEffect(() => {
    if (trigger) {
      setTrigger(true);
    }
  }, [trigger]);
  const { data: target } = useQuery("getMyTargetById", targetId);

  const invalidate = useInvalidateGrid();
  const onSubmit = async (data: TargetFormType) => {
    if (!data.id) {
      toast.error("Target ID is missing");
      return;
    }
    await client.authed.updateMyTarget(data.id!, data.title);
    toast("Target updated successfully");
    onOpenChange(false);
    await invalidate();
  };

  const { modal, openModal } = useModal("Confirm");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Target</DialogTitle>
        </DialogHeader>
        {target && <TargetForm initialValues={target} onChange={onSubmit} />}
        <Button
          onClick={() => {
            openModal({
              title: "Delete Target",
              description: "Are you sure you want to delete this target?",
              onConfirm: async () => {
                await client.authed.deleteMyTarget(targetId);
                onOpenChange(false);
                await invalidate();
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
