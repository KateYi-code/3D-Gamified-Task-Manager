import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modals";

interface Props {
  className?: string;
}
export const CreatePostButton = ({ className }: Props) => {
  const { openModal: openPostModal, modal: postModal } = useModal("CreatePostModal");

  return (
    <>
      {postModal}
      <div className={`flex flex-col items-end w-full ${className}`}>
        <Button
          onClick={() =>
            openPostModal({
              initialDescription: "",
              shouldRedirectToPlanet: false,
              taskId: undefined,
            })
          }
        >
          Post Moment +
        </Button>
      </div>
    </>
  );
};
