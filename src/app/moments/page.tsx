"use client";

import { PostsList } from "@/components/moment/posts-list";
import { CreatePostButton } from "@/components/moment/create-post-button";

export default function MomentsPage() {
  return (
    <div className="flex flex-col self-center items-center w-screen">
      <CreatePostButton className={"mt-6 mr-6"} />
      <PostsList />
    </div>
  );
}
