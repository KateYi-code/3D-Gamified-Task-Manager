"use client";

import { Post, User } from "@prisma/client";
import { PostsList } from "@/components/moment/posts-list";

export type PostHydrated = Post & {
  user: User;
};

export default function MomentsPage() {
  return <PostsList />;
}
