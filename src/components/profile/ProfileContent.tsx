"use client";

import { useAuth } from "@/providers/auth-provider";
import { CreatePostButton } from "@/components/moment/create-post-button";
import { PostsList } from "@/components/moment/posts-list";

interface Props {
  id: string;
}

export default function ProfileContent({ id }: Props) {
  const { user, loading: userLoading } = useAuth();
  const isMe = user?.id === id;

  if (userLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Please log in to see your moments timeline.</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-[100%] py-10 w-full self-center md:w-[800px] lg:w-[1000px] xl:w-[1200px]">
      {isMe && <CreatePostButton />}
      <PostsList userIds={[id]} />
    </div>
  );
}
