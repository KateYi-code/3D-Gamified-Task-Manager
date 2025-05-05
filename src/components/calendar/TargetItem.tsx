import { Target, Task } from "@prisma/client";
import { FC } from "react";
import { TaskItem } from "@/components/calendar/TaskItem";
import { FaRegEdit } from "react-icons/fa";

import { useModal } from "@/components/modals";

interface Props {
  target: Target;
  tasks: Task[];
}

/**
 * Functional component that represents a target item with associated tasks.
 * It renders a styled container displaying the target's title and a list of tasks.
 * Each task is presented with its title, and a button is provided to initiate a task.
 *
 * @component
 * @param {Object} Props - The properties passed to the component.
 * @param {Object} Props.target - The target object containing details such as title and id.
 * @param {string} Props.target.id - The unique identifier for the target.
 * @param {string} Props.target.title - The title of the target.
 * @param {Object[]} Props.tasks - An array of task objects associated with the target.
 * @param {string} Props.tasks[].id - The unique identifier for a task.
 * @param {string} Props.tasks[].title - The title of a task.
 * @returns {JSX.Element} A styled component displaying the target and relevant tasks.
 */
export const TargetItem: FC<Props> = ({ target, tasks }) => {
  const { modal: editModal, openModal } = useModal("TargetEditModal");
  return (
    <div key={target.id} className="rounded-lg overflow-hidden target-item">
      <div className={`p-4 text-center font-medium bg-gray-200 flex items-center justify-between `}>
        <span>{target.title}</span>
        <button
          onClick={() => {
            openModal({
              targetId: target.id,
            });
          }}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-300 target-item-menu-button p-1 rounded cursor-pointer"
        >
          <FaRegEdit size={20} />
        </button>
      </div>
      <div className={`p-4 space-y-3 flex flex-col items-stretch`}>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
      {editModal}
    </div>
  );
};
