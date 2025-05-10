"use client";

import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@/hooks/useQuery";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modals";
// import components

import SinglePost from "@/components/moment/singlePost";
import DetailPost from "@/components/moment/detailPost";
export default function MomentsPage() {
  const { user, loading } = useAuth();
  const [selectedPost, setSelectedPost] = useState(null);
  const { data: targets } = useQuery("getMyFollowingMoments");
  const { openModal: openPostModal, modal: postModal } =
    useModal("createPostModal");
  var userPosts = targets

  if (loading) {
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


    <div className="container mx-auto px-4 py-8">
      {/* header sector */}
      {postModal}
      <div className="flex items-center justify-between py-6 mb-6">
        <h1 className="text-2xl font-bold m-0">Moments Timeline</h1>
        <Button onClick={() => openPostModal({})}>Post Moment +</Button>
      </div>
      <div style={{ display: "flex" }}>
        <div className="flex h-[calc(100vh-15px)] gap-4">
          {/* Left column */}
          <div className="w-full md:w-1/3 md:pr-4 overflow-visible">
            <div className="h-full overflow-y-auto">
              <ul className="relative border-l-2 border-gray-300">
                {userPosts?.map((post, i) => (
                  <li key={`${i}`} className="relative pl-2 mb-2">
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
                )
                )}
              </ul>
            </div>
          </div>
          <div className="hidden pt-6 md:block w-full md:w-2/3 overflow-y-auto">
            {selectedPost ? (
              <DetailPost post={selectedPost} />
            ) : (
              <p className="text-gray-500 mt-10 text-center">Click a post to view details</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}