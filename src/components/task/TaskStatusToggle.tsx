import { FC } from "react";
import { TaskStatus } from "./TaskDraft";
import {
  IoIosRadioButtonOff,
  IoIosRadioButtonOn,
  IoIosCheckmarkCircle,
} from "react-icons/io";

interface TaskStatusToggleProps {
  status: TaskStatus;
  onClick: () => void;
}

export const TaskStatusToggle: FC<TaskStatusToggleProps> = ({
  status,
  onClick,
}) => {
  const iconProps = {
    size: 20,
    className: "cursor-pointer transition-transform duration-200 hover:scale-110",
    onClick,
  };

  switch (status) {
    case "PENDING":
      return <IoIosRadioButtonOff {...iconProps} color="green" />;
    case "IN_PROGRESS":
      return <IoIosRadioButtonOn {...iconProps} color="gold" />;
    case "COMPLETED":
      return <IoIosCheckmarkCircle {...iconProps} color="purple" />;
    default:
      return null;
  }
};
