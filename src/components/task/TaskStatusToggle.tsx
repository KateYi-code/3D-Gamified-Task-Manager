import { FC } from "react";
import { TaskStatus } from "./TaskDraft";
import { IoIosRadioButtonOff, IoIosRadioButtonOn, IoIosCheckmarkCircle } from "react-icons/io";

interface TaskStatusToggleProps {
  status: TaskStatus;
  onClick: () => void;
}

export const TaskStatusToggle: FC<TaskStatusToggleProps> = ({ status, onClick }) => {
  const iconProps = {
    size: 20,
    className: "cursor-pointer transition-transform duration-200 hover:scale-110",
    onClick,
  };

  switch (status) {
    case "PENDING":
      return <IoIosRadioButtonOff {...iconProps} color="green" data-testid={"PENDING"} />;
    case "IN_PROGRESS":
      return <IoIosRadioButtonOn {...iconProps} color="gold" data-testid={"IN_PROGRESS"} />;
    case "COMPLETED":
      return <IoIosCheckmarkCircle {...iconProps} color="purple" data-testid={"COMPLETED"} />;
    default:
      return null;
  }
};
