import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modals";

export const CreatePostButton = () => {
  const { openModal: openPostModal, modal: postModal } = useModal("CreatePostModal");

  return (
    <>
      {postModal}
      <div className="flex flex-col items-end w-full">
        <Button onClick={() => openPostModal({})}>Post Moment +</Button>
      </div>
    </>
  );
};
