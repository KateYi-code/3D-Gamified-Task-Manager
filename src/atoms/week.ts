import { addDays, addWeeks, startOfWeek } from "date-fns";
import { atom, useAtomValue, useSetAtom } from "jotai";

export const weekAtom = atom(startOfWeek(new Date()));

export const weekDaysAtom = atom((get) => {
  const weekDate = get(weekAtom);
  const start = startOfWeek(weekDate);
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
});

export const weekStartAtom = atom((get) => {
  const weekDate = get(weekAtom);
  return startOfWeek(weekDate);
});

export const weekEndAtom = atom((get) => {
  const weekDate = get(weekAtom);
  return addWeeks(startOfWeek(weekDate), 1);
});

export const useWeek = () => {
  const setWeek = useSetAtom(weekAtom);
  const week = useAtomValue(weekAtom);
  const weekDays = useAtomValue(weekDaysAtom);
  const weekStart = useAtomValue(weekStartAtom);
  const weekEnd = useAtomValue(weekEndAtom);

  return { setWeek, week, weekDays, weekStart, weekEnd };
};
