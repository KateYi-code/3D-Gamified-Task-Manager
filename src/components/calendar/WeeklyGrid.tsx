import { addDays, format, isToday, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { FC, useCallback, useMemo } from "react";
import { FaPlus } from "react-icons/fa6";

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

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-7 rounded-t-md">
      {weekDays.map((date) => {
        const isCurrentDay = isToday(date);
        return (
          <div
            key={date.toString()}
            className={`flex flex-col transition-all duration-200 hover:shadow-md rounded-md ${
              isCurrentDay ? "ring-2 ring-primary" : ""
            }`}
          >
            {/*Day*/}
            <div className={`text-center text-lg font-semibold p-2 bg-gray-50 rounded-t-md`}>
              <div>{format(date, "EEE")}</div>
              <div className={`text-xl`}>{format(date, "d")}</div>
            </div>

            {/* Targets */}
            <div className="group flex-1 min-h-[300px] border rounded-b-md p-3 hover:bg-gray-100 transition-colors flex flex-col">
              {/* Empty task list container */}
              <ul className="space-y-2 flex-grow">
                {/* Placeholder for task items */}
                <li className="text-sm text-gray-500">No tasks for today</li>
              </ul>

              {/* Add Task Button */}
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
                <FaPlus className="mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
