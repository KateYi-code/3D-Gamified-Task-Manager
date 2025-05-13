import { ModalProps } from "@/components/modals";
import DetailPost from "./detailPost";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = ModalProps & {
  postId: string;
};

export const DetailPostModal = ({ open, postId, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[700px] sm:max-w-[700px]">
        <DetailPost postId={postId} />
      </DialogContent>
    </Dialog>
  );
};
