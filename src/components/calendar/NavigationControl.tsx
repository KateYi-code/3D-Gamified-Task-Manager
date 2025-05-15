import { Button } from "@/components/ui/button";
import { endOfWeek, format, isSameWeek, startOfWeek } from "date-fns";
import { FC, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GrRevert } from "react-icons/gr";
import { useWeek } from "@/atoms/week";

interface Props {
  onNavigate: (direction: "prev" | "next" | "current") => void;
}
export const NavigationControl: FC<Props> = ({ onNavigate }) => {
  const { week: weekCurrent } = useWeek();
  const weekNow = useMemo(() => startOfWeek(new Date()), []);
  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        variant="outline"
        size="default"
        onClick={() => onNavigate("prev")}
        className="hover:bg-gray-100 transition-colors"
      >
        <FaChevronLeft />
        <span className="hidden md:inline">Previous Week</span>
      </Button>

      <div className={"flex flex-col items-center"}>
        <h2 className="text-base md:text-lg font-semibold">
          {`${format(startOfWeek(weekNow), "MMM d")} - ${format(endOfWeek(weekNow), "MMM d, yyyy")}`}
        </h2>
        {!isSameWeek(weekNow, weekCurrent) && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => onNavigate("current")}
            className="mt-2"
          >
            <GrRevert />
            Today
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="default"
        onClick={() => onNavigate("next")}
        className="hover:bg-gray-100 transition-colors"
      >
        <span className="hidden md:inline">Next Week</span>
        <FaChevronRight />
      </Button>
    </div>
  );
};
