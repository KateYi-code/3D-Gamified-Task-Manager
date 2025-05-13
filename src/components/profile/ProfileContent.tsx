"use client";

import { useAuth } from "@/providers/auth-provider";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SinglePost from "@/components/moment/singlePost";
import DetailPost from "@/components/moment/detailPost";
import { PageRequest } from "@/lib/pagination";
import { Post, User } from "@prisma/client";
import { client } from "@/endpoints/client";
import { If } from "@/lib/If";
import { useModal } from "@/components/modals";

export type PostHydrated = Post & {
  user: User;
};

interface Props {
  id: string
}

export default function ProfileContent({ id }: Props) {
  const { user, loading: userLoading } = useAuth();
  const [page, setPage] = useState<PageRequest>({
    page: 0,
    pageSize: 10,
  });
  const { openModal: openPostModal, modal: postModal } = useModal("CreatePostModal");
  const [posts, setPosts] = useState<PostHydrated[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostHydrated>();
  const [isEnd, setIsEnd] = useState(false);
  const onLoadMore = useCallback(() => {
    if (isLoading) return;
    setPage((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, [isLoading]);

  const isMe = user?.id === id

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchPosts = async () => {
      try {
        const data = await client.unauth.getUserPosts(id,page);
        if (data.items.length === 0) {
          setIsEnd(true);
          return;
        }
        setPosts((prev) => [...prev, ...data.items]);
      } catch (err) {
        console.error("Failed to fetch user's posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [id, page, user]);

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
    <div className="flex flex-col items-center h-[100%] py-10 w-full md:w-[1200px] self-center">
      {postModal}
      {isMe && (
      <div className="flex flex-col items-end w-full">
        <Button className="py-6 mb-6" onClick={() => openPostModal({})}>
          Post Moment +
        </Button>
      </div>
      )}
      <div className="flex justify-center h-[100%]">
        {/* Left column */}
        <div className="w-full md:w-1/4 md:pr-4 md:min-w-[500px] overflow-visible max-h-[100%] ">
          <div className="h-full overflow-y-auto pl-2 flex flex-col max-h-[100%]">
            <ul className="relative border-l-2 border-gray-300">
              {posts?.map((post) => (
                <li key={`${post.id}`} className="relative pl-2 mb-2">
                  <div className="absolute -left-2 top-0 flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full z-10" />
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-8 pt-6">
                    <SinglePost
                      onClick={() =>
                        setSelectedPost({
                          ...post,
                          user: post.user, // include author info
                        })
                      }
                      className="hover:bg-gray-100 cursor-pointer"
                      post={{
                        ...post,
                        user: post.user,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <If condition={isEnd}>
              <div className="text-center text-gray-500 mt-4">No more posts to load.</div>
            </If>
            <If condition={!isEnd}>
              <Button
                hidden={isEnd}
                className="mt-4"
                variant="outline"
                disabled={isLoading}
                onClick={() => onLoadMore()}
              >
                Load More...
              </Button>
            </If>
          </div>
        </div>
        <div className="hidden md:flex md:w-2/4 pt-6 overflow-y-auto max-w-[600px]">
          {selectedPost ? (
            <DetailPost post={selectedPost} />
          ) : (
            <p className="text-gray-500 text-center">Click a post to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}