import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FC } from "react";
import { ModalProps, useModal } from "@/components/modals";
import { toast } from "sonner";
import { client } from "@/endpoints/client";
import { useInvalidateQuery, useQuery } from "@/hooks/useQuery";
import { TargetForm, TargetFormType } from "@/components/target/TargetForm";
import { Button } from "@/components/ui/button";

type Props = ModalProps & {
  targetId: string;
};

export const TargetEditModal: FC<Props> = ({ open, onOpenChange, targetId }) => {
  const invalidate = useInvalidateQuery();
  const { data: target, refetch } = useQuery("getMyTargetById", targetId);

  const onSubmit = async (data: TargetFormType) => {
    await client.authed.updateMyTarget(targetId, data.title);
    onOpenChange(false);
    await invalidate("getMyTargets");
    await refetch();
    toast("Target updated successfully");
  };

  const { modal, openModal } = useModal("Confirm");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Target</DialogTitle>
        </DialogHeader>
        {target && <TargetForm onSubmit={onSubmit} initialValues={target} />}
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
