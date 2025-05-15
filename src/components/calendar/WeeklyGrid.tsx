import { format, isSameDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";
import { FaPlus } from "react-icons/fa6";
import { useQuery } from "@/hooks/useQuery";
import { TargetItem } from "@/components/calendar/TargetItem";
import { useModal } from "@/components/modals";
import lodash from "lodash";
import { useWeek } from "@/atoms/week";

export const WeeklyGrid = () => {
  // Generate array of dates for the current week (Sunday to Saturday)
  const { weekDays, weekStart, weekEnd } = useWeek();

  const { data: tasks, refetch } = useQuery("getMyTasksOfWeek", weekStart, weekEnd);

  useEffect(() => {
    console.log({ tasks });
  }, [tasks]);

  const targets = useMemo(() => {
    return weekDays.map((date) => {
      // tasks of the day by task.date
      const tasksOfDay = tasks?.filter((task) => isSameDay(new Date(task.date), date));
      return lodash
        .chain(tasksOfDay)
        .groupBy((t) => t.targetId)
        .mapValues((tasks) => ({
          ...tasks[0].target,
          tasks: tasks,
        }))
        .values()
        .value();
    });
  }, [tasks, weekDays]);

  const onUpdate = async () => {
    await refetch();
  };

  const { modal: taskCreateModal, openModal } = useModal("TaskCreateModel");

  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-3 xl:grid-cols-7 rounded-t-md">
      {weekDays.map((date, i) => {
        const isCurrentDay = isToday(date);
        const dayOfWeek = format(date, "EEE");
        const currentTargets = targets[i];
        return (
          <div
            key={date.toString()}
            data-testid={`weekly-grid-day-${dayOfWeek}`}
            className="flex flex-col"
          >
            {/*Day*/}
            <div
              className={`text-center text-lg font-semibold p-2 rounded-t-md ${
                isCurrentDay ? "bg-primary" : "bg-accent"
              }`}
            >
              <div>{dayOfWeek}</div>
              <div className="text-xl">{format(date, "d")}</div>
            </div>

            {/* Targets */}
            <div className="h-1" />
            <div className="group flex-1 min-h-[300px] hover:bg-accent flex flex-col">
              {/* Empty task list container */}
              <div className="space-y-1 flex-grow">
                {currentTargets.map((target) => (
                  <TargetItem
                    key={target.id}
                    target={target}
                    tasks={target.tasks}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>

              {/* Add Target Button */}
              <Button
                data-testid="add-target-button"
                variant="default"
                size="sm"
                onClick={() => openModal({ initialDate: date, initialDuration: 20 })}
                className="w-full text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
                <FaPlus className="mr-1" />
                New Task
              </Button>
              {taskCreateModal}
            </div>
          </div>
        );
      })}
    </div>
  );
};
