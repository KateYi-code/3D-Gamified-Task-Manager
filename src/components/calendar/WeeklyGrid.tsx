import { addDays, format, isToday, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { FC, useCallback, useMemo } from "react";
import { FaPlus } from "react-icons/fa6";
import { useQuery } from "@/hooks/useQuery";
import { TargetItem } from "@/components/calendar/TargetItem";
import { useModal } from "@/components/modals";
import { isSameDay } from "date-fns";

interface Props {
  currentDate: Date;
}

export const WeeklyGrid: FC<Props> = ({ currentDate }) => {
  // Generate array of dates for the current week (Sunday to Saturday)
  const getWeekDays = useCallback((date: Date): Date[] => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate, getWeekDays]);

  const { data: targets, refetch } = useQuery("getMyTargets");

  const { openModal, modal } = useModal("TargetCreateModal");

  const onUpdate = async () => {
    await refetch();
  };

  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-3 xl:grid-cols-7 rounded-t-md">
      {weekDays.map((date) => {
        const isCurrentDay = isToday(date);
        return (
          <div key={date.toString()}>
            {/*Day*/}
            <div
              className={`text-center text-lg font-semibold p-2 rounded-t-md ${
                isCurrentDay ? "bg-primary" : "bg-accent"
              }`}
            >
              <div>{format(date, "EEE")}</div>
              <div className="text-xl">{format(date, "d")}</div>
            </div>

            {/* Targets */}
            <div className="h-1" />
            <div className="group flex-1 min-h-[300px] hover:bg-accent flex flex-col">
              {/* Empty task list container */}
              <div className="space-y-1 flex-grow">
                {(targets ?? [])
                  .filter((target) => isSameDay(new Date(target.placedAt), date)) // Filter targets by date
                  .map((target) => (
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
                variant="default"
                size="sm"
                onClick={() => openModal({ targetDate: date })}
                className="w-full text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
                <FaPlus className="mr-1" />
                New Target
              </Button>
              {modal}
            </div>
          </div>
        );
      })}
    </div>
  );
};
