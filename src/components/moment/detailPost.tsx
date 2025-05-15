import React, { useMemo } from "react";
import clsx from "clsx";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FaRegThumbsUp } from "react-icons/fa";
import { useInvalidateQuery, useQuery } from "@/hooks/useQuery";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth-provider";
import { TextAvatar } from "@/components/profile/TextAvatar";

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
          <div className="flex flex-row items-center gap-2.5">
            <TextAvatar name={post.user.name ?? post.user.email} size={"small"} />
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
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          {post.images?.map((src, index) => (
            <img key={index} src={src} alt="" className="aspect-auto" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
