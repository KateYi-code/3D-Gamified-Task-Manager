import { TargetCreateModal } from "@/components/target/TargetCreateModal";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { TargetEditModal } from "@/components/target/TargetEditModal";
import { Confirm } from "@/components/target/confirm";
import { CreatePostModal } from "./moment/createPostModal";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const modals = {
  TargetCreateModal,
  TargetEditModal,
  Confirm,
  CreatePostModal,
};

export type Modals = typeof modals;
export type ModalTypes = keyof Modals;

export const useModal = <T extends ModalTypes>(name: T) => {
  type Props = Omit<ComponentProps<Modals[T]>, "open" | "onOpenChange">;

  const [props, setProps] = useState<Props>();
  const [open, setOpen] = useState(false);

  const openModal = useCallback((props: Props) => {
    setProps(props);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setProps(undefined);
    setOpen(false);
  }, []);

  const modal = useMemo(() => {
    if (!open) return null;
    if (!props) return null;
    const Modal = modals[name] as any;
    return <Modal {...props} open={open} onOpenChange={setOpen} />;
  }, [name, open, props]);

  return {
    openModal,
    closeModal,
    modal,
  };
};
