import { Endpoints } from "@/endpoints";
import * as hooks from "@tanstack/react-query";
import { client } from "@/endpoints/client";

export const useMutation = <K extends keyof Endpoints>(
  name: K,
  ...params: Parameters<Endpoints[K]>
) => {
  return hooks.useMutation({
    mutationFn: () => client.call(name, ...params),
  });
};
