import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FC, useState } from "react";
import type { ModalProps } from "@/components/modals";
import { client } from "@/endpoints/client";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

type Props = ModalProps & {};

export const TargetCreateModal: FC<Props> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const onCreate = async () => {
    if (!title) return;
    await client.authed.createMyTarget(title);
    toast("Target created successfully");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="target-create-modal">
        <DialogHeader>
          <DialogTitle>Create Target</DialogTitle>
        </DialogHeader>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button onClick={onCreate}>Create</Button>
      </DialogContent>
    </Dialog>
  );
};
