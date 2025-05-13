import { useAuth } from "@/providers/auth-provider";
import { useCallback, useMemo, useState } from "react";
import { PageRequest } from "@/lib/pagination";
import { useQuery } from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import SinglePost from "@/components/moment/singlePost";
import { If } from "@/lib/If";
import { CreatePostButton } from "@/components/moment/create-post-button";
import { useModal } from "@/components/modals";

export const PostsList = () => {
  const { user, loading: userLoading } = useAuth();
  const [page, setPage] = useState<PageRequest>({
    page: 0,
    pageSize: 10,
  });

  const { openModal: openPostModal, modal: detailPostModal } = useModal("DetailPostModal");
  const onLoadMore = useCallback(() => {
    setPage((prev) => ({
      ...prev,
      pageSize: page.pageSize + 10,
    }));
  }, [page.pageSize]);

  const { data: posts, isLoading } = useQuery("getMyFollowingMoments", page);

  const isEnd = useMemo(() => {
    if (!posts?.items) return false;
    const { page: pageIndex, pageSize } = page;
    const totalPosts = posts.items.length;
    const totalPages = Math.ceil(totalPosts / pageSize);
    return pageIndex >= totalPages - 1;
  }, [page, posts?.items]);

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
    <div className="flex flex-col items-center py-10 w-full md:w-[1200px] self-center">
      <CreatePostButton />
      {detailPostModal}
      <div className="flex justify-center ">
        {/* Left column */}
        <div className="w-full md:w-1/4 md:pr-4 md:min-w-[500px]">
          <div className="h-full overflow-y-auto pl-2 flex flex-col">
            <ul className="relative border-l-2">
              {posts?.items?.map((post) => (
                <li key={`${post.id}`} className="relative pl-2 mb-2">
                  <div className="absolute -left-2 top-0 flex items-center space-x-2">
                    <div className="w-4 h-4 bg-background border-2 rounded-full z-10" />
                    <span className="text-xs text-foreground">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-8 pt-6">
                    <SinglePost
                      onClick={() => {
                        openPostModal({
                          postId: post.id,
                        });
                      }}
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
      </div>
    </div>
  );
};
