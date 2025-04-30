"use client";

import { useQuery } from "@/hooks/useQuery";

export const UserList = () => {
  const { data: users } = useQuery("getUsers");
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
