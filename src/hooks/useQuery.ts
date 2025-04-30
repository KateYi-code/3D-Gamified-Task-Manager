import { Endpoints, ReturnOfEndpoint } from "@/endpoints";
import * as hooks from "@tanstack/react-query";
import { client } from "@/endpoints/client";

export const useQuery = <K extends keyof Endpoints>(
  name: K,
  ...params: Parameters<Endpoints[K]>
) => {
  return hooks.useQuery<ReturnOfEndpoint<K>>({
    queryFn: () =>
      (client.authed as unknown as any)[name](...params) as Promise<ReturnOfEndpoint<K>>,
    queryKey: [name, ...params],
  });
};
