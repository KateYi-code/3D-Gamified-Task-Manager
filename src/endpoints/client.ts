import superjson from "superjson";
import { authEndpoints, unauthEndpoints } from "@/endpoints/endpoints";

export type Client = {
  authed: typeof authEndpoints;
  unauth: typeof unauthEndpoints;
};

const createClient = (url: string): Client => {
  const callRemoteMethod = async (endpoint: string, params: any[]) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: endpoint,
        params: params,
      }),
    });

    if (!res.ok) {
      throw new Error((await res.json()).details ?? "Unknown error");
    }
    const superJsonResult = await res.json();
    return superjson.deserialize(superJsonResult);
  };
  const createProxy = () =>
    new Proxy(
      {},
      {
        get(target, p) {
          return function () {
            // eslint-disable-next-line prefer-rest-params
            return callRemoteMethod(p as string, [...arguments]);
          };
        },
      },
    );
  const authed = createProxy() as typeof authEndpoints;
  const unauth = createProxy() as typeof unauthEndpoints;
  return {
    authed,
    unauth,
  };
};

export const client = createClient("/api/endpoints");
