import { addWeeks, startOfWeek } from "date-fns";

export const getWeekStartEndDate = (date: Date) => {
  const start = startOfWeek(date);
  const end = addWeeks(startOfWeek(date), 1);

  return { start, end };
};
