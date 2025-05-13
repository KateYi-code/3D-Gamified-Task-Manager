import React, { useEffect, useState } from "react";
import clsx from "clsx";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { TiTick } from "react-icons/ti";
import { FaRegThumbsUp } from "react-icons/fa";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SinglePost(props) {
  const post = props.post;
  const [liked, setLiked] = useState(false);

  async function likePost(e) {
    e.stopPropagation();
    const data = await client.authed.likePost(post.id, post.user.id);
    if (data) {
      setLiked(true);
      toast("You Like the Post!");
    } else {
      setLiked(false);
      toast("You remove the like!");
    }
  }
  useEffect(() => {
    client.authed.getLikeState(post.id, post.user.id).then((res) => {
      setLiked(res);
    });
  }, [post.id]);

  return (
    <Card
      onClick={props.onClick}
      className={clsx(
        "w-full h-full transition-shadow duration-150 ease-in-out overflow-hidden",
        props.className,
      )}
    >
      <CardHeader>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "Top", gap: "10px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "pink",
                display: "inline-block",
                marginLeft: "-14px",
              }}
            ></div>
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
          <span className="overflow-hidden truncate"> Task {post.task?.id}</span>
        </CardDescription>
        <div className="text-xs text-foreground">{new Date(post.createdAt).toLocaleString()}</div>
      </CardHeader>
      <CardContent className={"pb-2"}>
        {post.text}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
          {post.images.map((image, index) => {
            return (
              <img key={index} src={image} alt="" style={{ width: "150px", height: "150px" }} />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
