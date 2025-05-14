import React, { useEffect, useState } from "react";
import clsx from "clsx";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { TiTick } from "react-icons/ti";
import { FaRegThumbsUp } from "react-icons/fa";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Post, Task, User } from "@prisma/client";
import { TextAvatar } from "@/components/profile/TextAvatar";

interface Props {
  post: Post & {
    user: User;
    task: Task | null;
  };
  onClick?: () => void;
  className?: string;
}

export default function SinglePost(props: Props) {
  const post = props.post;
  const [liked, setLiked] = useState(false);

  const likePost = async (e: any) => {
    e.stopPropagation();
    const data = await client.authed.likePost(post.id, post.user.id);
    if (data) {
      setLiked(true);
      toast("You Like the Post!");
    } else {
      setLiked(false);
      toast("You remove the like!");
    }
  };
  useEffect(() => {
    client.authed.getLikeState(post.id, post.user.id).then((res) => {
      setLiked(res);
    });
  }, [post.id, post.user.id]);

  return (
    <Card
      onClick={props.onClick}
      className={clsx(
        "w-full h-full transition-shadow duration-150 ease-in-out overflow-hidden",
        props.className,
      )}
    >
      <CardHeader>
        <div className="flex flex-row items-center gap-2.5 justify-between">
          <div className="flex flex-row items-center gap-2.5">
            <TextAvatar name={post.user.name ?? post.user.email} size={"small"} />
            <span>{post.user.name}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <FaRegThumbsUp
                  onClick={(e) => likePost(e)}
                  className={clsx(
                    "cursor-pointer",
                    liked
                      ? "text-primary hover:text-foreground"
                      : "text-foreground hover:text-primary",
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                {liked ? <p>unlike the post</p> : <p>Like the post</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              border: "1px solid",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TiTick />
          </div>
          <span className="overflow-hidden truncate"> Task {post.task?.title}</span>
        </CardDescription>
        <div className="text-xs text-foreground">{new Date(post.createdAt).toLocaleString()}</div>
      </CardHeader>
      <CardContent className={"pb-2"}>
        {post.text}
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          {post.images.map((image, index) => {
            return <img key={index} src={image} alt="" className="aspect-square max-w-36" />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
