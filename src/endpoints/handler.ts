import { EndpointKey, endpoints } from "./endpoints";
import superjson from "superjson";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionByToken } from "@/endpoints/users/services/user.service";
import { Session, User } from "@prisma/client";

const getUserFromSession = async () => {
  const cookie = await cookies();
  const sessionToken = cookie.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await getSessionByToken(sessionToken);

  if (!session || new Date(session.expires) < new Date()) {
    cookie.delete("session");
    return null;
  }

  const { user } = session;
  return {
    user,
    session,
  };
};

export const userAsyncStorage = new AsyncLocalStorage<{
  user: User;
  session: Session;
} | null>();

export const getSession = () => {
  const { user, session } = userAsyncStorage.getStore() || {};
  if (!user || !session) {
    return {};
  }
  return {
    user,
    session,
  };
};

export const endpointHandler = async (req: Request) => {
  const { endpoint, params }: { endpoint: EndpointKey; params: any[] } = await req.json();

  const session = await getUserFromSession();

  try {
    // Get the endpoint function from our API definition
    const endpointFn: any = endpoints[endpoint];
    if (!endpointFn) {
      return NextResponse.json(
        { error: `Endpoint ${endpoint} not found` },
        {
          status: 404,
        },
      );
    }

    // Execute the endpoint with the provided input
    const result = await userAsyncStorage.run(session, () => endpointFn(...params));

    const serialized = superjson.serialize(result);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error executing endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
};
