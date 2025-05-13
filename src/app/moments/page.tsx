"use client";

import { PostsList } from "@/components/moment/posts-list";
import { CreatePostButton } from "@/components/moment/create-post-button";

export default function MomentsPage() {
  return (
    <div className="flex flex-col self-center items-center w-full lg:w-[1200px]">
      <CreatePostButton className={"mt-10 mr-10"} />
      <PostsList />
    </div>
  );
}
