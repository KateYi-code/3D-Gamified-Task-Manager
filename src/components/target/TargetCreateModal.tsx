import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FC } from "react";
import type { ModalProps } from "@/components/modals";
import { toast } from "sonner";
import { client } from "@/endpoints/client";
import { useInvalidateQuery } from "@/hooks/useQuery";
import { TargetForm, TargetFormType } from "@/components/target/TargetForm";

type Props = ModalProps;

export const TargetCreateModal: FC<Props> = ({ open, onOpenChange }) => {
  const invalidate = useInvalidateQuery();
  const onSubmit = async (data: TargetFormType) => {
    await client.authed.createMyTarget(data.title);
    onOpenChange(false);
    await invalidate("getMyTargets");
    toast("Target created successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Target</DialogTitle>
        </DialogHeader>
        <TargetForm onSubmit={onSubmit} initialValues={{ title: "" }} />
      </DialogContent>
    </Dialog>
  );
};
