import { Endpoints } from "@/endpoints";
import * as hooks from "@tanstack/react-query";
import { client } from "@/endpoints/client";

export const useQuery = <K extends keyof Endpoints>(
  name: K,
  ...params: Parameters<Endpoints[K]>
) => {
  return hooks.useQuery({
    queryFn: () => client.call(name, ...params),
    queryKey: [name, ...params],
  });
};
