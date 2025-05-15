import { ModalProps } from "@/components/modals";
import DetailPost from "./detailPost";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Props = ModalProps & {
  postId: string;
};

export const DetailPostModal = ({ open, postId, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[700px] sm:max-w-[700px] max-h-4/5 overflow-auto">
        <VisuallyHidden>
          <DialogTitle>hello</DialogTitle>
        </VisuallyHidden>
        <DetailPost postId={postId} />
      </DialogContent>
    </Dialog>
  );
};
