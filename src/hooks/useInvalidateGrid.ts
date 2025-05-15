import { useCallback } from "react";
import { useInvalidateQuery } from "@/hooks/useQuery";

export const useInvalidateGrid = () => {
  const invalidate = useInvalidateQuery();
  return useCallback(async () => {
    await invalidate("getMyTasksOfWeek");
  }, [invalidate]);
};
