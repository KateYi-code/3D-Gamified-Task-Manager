import { Target, Task } from "@prisma/client";
import { FC, useState } from "react";
import { TaskItem } from "@/components/calendar/TaskItem";
import { FaRegEdit } from "react-icons/fa";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { useEffect } from "react";
import { TaskStatus} from "@prisma/client";

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
export const TargetItem: FC<Props> = ({ target, tasks ,onUpdate}) => {
  const { modal: editModal, openModal } = useModal("TargetEditModal");
  const [update, setUpdate] = useState(false);
  const hasTasks = tasks.length > 0;

    const [LocalTasks, setLocalStatus] = useState(tasks);
    useEffect(() => {
        setLocalStatus(tasks);
        setUpdate(false);
    }, [update]);
  
    const onUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
      setLocalStatus(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, status }
            : t
        )
      );
      await client.authed.updateMyTaskStatus(taskId, status);
      onUpdate();
      toast("task status updated successfully");
    };

  return (
    <div key={target.id} className="shadow-sm rounded-lg overflow-hidden target-item">
      <div className={`p-4 text-center font-medium bg-gray-200 flex items-center justify-between `}>
        <span>{target.title}</span>
        <button
          onClick={() => {
            openModal({
              targetId: target.id,
              tasks: tasks,
              target: target,
              setUpdate: setUpdate,
              LocalTasks: LocalTasks,
            });
          }}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-300 target-item-menu-button p-1 rounded cursor-pointer"
        >
          <FaRegEdit size={20} />
        </button>
      </div>
      {hasTasks && (
        <>
          <div className="p-4 space-y-3 flex flex-col items-stretch">
            {LocalTasks.map((task) => (
              <TaskItem key={task.id} task={task} onUpdate={onUpdate} onUpdateTaskStatus={onUpdateTaskStatus}/>
            ))}
          </div>
        </>
      )}
      {editModal}
    </div>
  );
};
