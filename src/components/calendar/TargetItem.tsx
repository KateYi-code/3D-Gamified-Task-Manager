import { Target, Task, TaskStatus } from "@prisma/client";
import { FC } from "react";
import { TaskItem } from "@/components/calendar/TaskItem";
import { FaRegEdit } from "react-icons/fa";
import { client } from "@/endpoints/client";
import { toast } from "sonner";

import { useModal } from "@/components/modals";

interface Props {
  target: Target;
  tasks: Task[];
  onUpdate: () => void;
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
export const TargetItem: FC<Props> = ({ target, tasks, onUpdate }) => {
  const { modal: editModal, openModal } = useModal("TargetEditModal");
  const hasTasks = tasks.length > 0;

  const onUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    await client.authed.updateMyTaskStatus(taskId, status);
    onUpdate();
    toast("task status updated successfully");
  };

  return (
    <div key={target.id} className="shadow-sm rounded-lg overflow-hidden target-item border">
      <div
        className={`p-4 text-center font-medium bg-accent flex items-center justify-between border`}
      >
        <span>{target.title}</span>
        <button
          onClick={() => {
            openModal({
              targetId: target.id,
            });
          }}
          className="text-primary hover:bg-accent target-item-menu-button p-1 rounded cursor-pointer"
        >
          <FaRegEdit size={20} />
        </button>
      </div>
      {hasTasks && (
        <>
          <div className="p-4 space-y-3 flex flex-col items-stretch">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} onUpdateTaskStatus={onUpdateTaskStatus} />
            ))}
          </div>
        </>
      )}
      {editModal}
    </div>
  );
};
