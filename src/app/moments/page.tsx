"use client";

import { PostsList } from "@/components/moment/posts-list";
import { CreatePostButton } from "@/components/moment/create-post-button";

export default function MomentsPage() {
  return (
    <div className="flex flex-col self-center items-center w-screen">
      <div className="md:w-[800px] lg:w-[1000px] xl:w-[1200px]">
        <CreatePostButton className={"mt-6 mr-6"} />
      </div>
      <PostsList showPlanet={false} />
    </div>
  );
}
