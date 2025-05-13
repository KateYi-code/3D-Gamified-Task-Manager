"use client";

import { useAuth } from "@/providers/auth-provider";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modals";
import SinglePost from "@/components/moment/singlePost";
import DetailPost from "@/components/moment/detailPost";
import { PageRequest } from "@/lib/pagination";
import { Post, User } from "@prisma/client";
import { client } from "@/endpoints/client";
import { If } from "@/lib/If";

export type PostHydrated = Post & {
  user: User;
};

export default function MomentsPage() {
  const { user, loading: userLoading } = useAuth();
  const [page, setPage] = useState<PageRequest>({
    page: 0,
    pageSize: 10,
  });

  const [posts, setPosts] = useState<PostHydrated[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostHydrated>();
  const { openModal: openPostModal, modal: postModal } = useModal("CreatePostModal");

  const [isEnd, setIsEnd] = useState(false);
  const onLoadMore = useCallback(() => {
    if (isLoading) return;
    setPage((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, [isLoading]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchPosts = async () => {
      try {
        const posts = await client.authed.getMyFollowingMoments(page);
        if (posts.items.length === 0) {
          setIsEnd(true);
          return;
        }
        setPosts((prev) => [...prev, ...posts.items]);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page, user]);

  if (userLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
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
      <div className="flex flex-col items-end w-full">
        <Button onClick={() => openPostModal({})}>Post Moment +</Button>
      </div>
      <div className="flex justify-center h-[100%]">
        {/* Left column */}
        <div className="w-full md:w-1/4 md:pr-4 md:min-w-[500px] overflow-visible max-h-[100%] ">
          <div className="h-full overflow-y-auto pl-2 flex flex-col max-h-[100%]">
            <ul className="relative border-l-2">
              {posts?.map((post) => (
                <li key={`${post.id}`} className="relative pl-2 mb-2">
                  <div className="absolute -left-2 top-0 flex items-center space-x-2">
                    <div className="w-4 h-4 bg-background border-2 rounded-full z-10" />
                    <span className="text-xs text-foreground">
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
                      className="hover:bg-secondary cursor-pointer"
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
              <div className="text-center mb-12 mt-12">No more posts to load.</div>
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
            <p className="text-center">Click a post to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
