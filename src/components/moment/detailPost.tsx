import React, { useMemo } from "react";
import clsx from "clsx";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FaRegThumbsUp } from "react-icons/fa";
import { useInvalidateQuery, useQuery } from "@/hooks/useQuery";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth-provider";

interface Props {
  postId: string;
  className?: string;
}
export default function DetailPost(props: Props) {
  const { user } = useAuth();
  const { data: post } = useQuery("getPostById", props.postId);
  const invalidate = useInvalidateQuery();
  const { task } = post || {};

  const liked = useMemo(() => {
    return !!post?.likes.find((like) => like.user.id === user?.id);
  }, [post?.likes, user?.id]);

  const likePost = async () => {
    if (!post) return;
    const data = await client.authed.likePost(post.id, post.user.id);
    invalidate("getPostById", props.postId);
    if (data) {
      toast("You Like the Post!");
    } else {
      toast("You remove the like!");
    }
  };

  if (!post) return null; // safeguard

  return (
    <Card className={clsx("w-full shadow-none border-none", props.className)}>
      <CardHeader>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "pink",
              }}
            />
            <span>{post.user?.name}</span>
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <FaRegThumbsUp
                    onClick={() => likePost()}
                    className={clsx(
                      "cursor-pointer",
                      liked
                        ? "text-primary hover:text-accent-foreground"
                        : "text-accent-foreground hover:text-primary",
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {liked ? <p>unlike the post</p> : <p>Like the post</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardDescription
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        ></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p>{post.text}</p>
        <div>
          <span>Complete Time: {new Date(post.updatedAt).toLocaleString()}</span>
          <h2>Task Title: {task?.title} </h2>
          <p>Task Description: {task?.description}</p>
        </div>
        <div className="flex gap-2.5 mt-2.5 flex-wrap">
          {post.images?.map((src, index) => (
            <img key={index} src={src} alt="" style={{ width: "150px", height: "150px" }} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
