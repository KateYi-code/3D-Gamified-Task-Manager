"use client";

import { useQuery } from "@tanstack/react-query";
import { endpointClient } from "@/endpoints/client";

export const UserList = () => {
  const { data: users } = useQuery({
    queryFn: async () => {
      return endpointClient.call("user/list");
    },
    queryKey: ["user/list"],
  });
  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>
          {user.name} - {user.email}, sessions: {user.sessions.length}
        </li>
      )) ?? <li>No users found</li>}
    </ul>
  );
};
