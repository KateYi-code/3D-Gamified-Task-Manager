import { FC } from "react";
import { IoIosRadioButtonOff, IoIosRadioButtonOn, IoIosCheckmarkCircle } from "react-icons/io";
import { TaskStatus } from "@prisma/client";

interface TaskStatusToggleProps {
  status: TaskStatus;
  onClick: () => void;
  className?: string;
}

export const TaskStatusToggle: FC<TaskStatusToggleProps> = ({ status, onClick, className }) => {
  const iconProps = {
    size: 20,
    className: "cursor-pointer transition-transform duration-200 hover:scale-110",
    onClick,
  };

  switch (status) {
    case "PENDING":
      return (
        <IoIosRadioButtonOff
          {...iconProps}
          color="green"
          data-testid={"PENDING"}
          className={className}
        />
      );
    case "IN_PROGRESS":
      return (
        <IoIosRadioButtonOn
          {...iconProps}
          color="gold"
          data-testid={"IN_PROGRESS"}
          className={className}
        />
      );
    case "COMPLETED":
      return (
        <IoIosCheckmarkCircle
          {...iconProps}
          color="purple"
          data-testid={"COMPLETED"}
          className={className}
        />
      );
    default:
      return null;
  }
};
