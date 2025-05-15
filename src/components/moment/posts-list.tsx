import { useAuth } from "@/providers/auth-provider";
import { useCallback, useMemo, useState } from "react";
import { PageRequest } from "@/lib/pagination";
import { useQuery } from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import SinglePost from "@/components/moment/singlePost";
import { If } from "@/lib/If";
import { useModal } from "@/components/modals";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const PlanetView = dynamic(() => import("@/app/planet/page"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
    </div>
  ),
});

interface Props {
  userIds?: string[];
}
export const PostsList = ({ userIds }: Props) => {
  const params = useParams();
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

  const { data: posts, isLoading } = useQuery("getMyFollowingMoments", page, userIds);

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
    <div className="flex flex-col items-center mt-6 self-center px-4 md:w-[800px] lg:w-[1000px] xl:w-[1200px] pb-20 sm:pb-0 w-full">
      <div className="flex w-full gap-8">
        <div className="flex flex-col items-center flex-1">
          {detailPostModal}
          <div className="grid grid-cols-1 gap-4 w-full">
            {posts?.items?.map((post) => (
              <div key={`${post.id}`} className="flex flex-col md:max-h-[400px] md:min-h-[400px]">
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
            ))}
          </div>
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
          <If condition={isEnd}>
            <div className="text-center self-stretch mb-12 mt-12 border-t pt-6">
              No more posts to load.
            </div>
          </If>
        </div>

        <div className="hidden lg:block w-[600px] h-[600px] sticky top-4 rounded-lg overflow-hidden bg-background border">
          <div className="w-full h-full">
            <PlanetView params={{ id: params.id }} />
          </div>
        </div>
      </div>
    </div>
  );
};
