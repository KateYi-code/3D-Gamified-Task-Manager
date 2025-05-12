import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModalProps } from "@/components/modals";
import { Button } from "@/components/ui/button";

interface InfoModalProps extends ModalProps {
  title: string;
  message: string;
}

export const InfoModal: FC<InfoModalProps> = ({ open, onOpenChange, title, message }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <p className="mt-2">{message}</p>
      <div className="flex justify-end mt-4">
        <Button onClick={() => onOpenChange(false)}>OK</Button>
      </div>
    </DialogContent>
  </Dialog>
);
