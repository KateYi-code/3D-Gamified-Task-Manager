import React from "react";
import clsx from "clsx";

// import UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import icons
import { TiTick } from "react-icons/ti";
import { FaRegThumbsUp } from "react-icons/fa";
import { client } from "@/endpoints/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SinglePost(props) {
  const user = props.post;
  const [liked, setLiked] = useState(false);

  async function likePost(e) {
    e.stopPropagation();
    const data = await client.authed.LikePost(user.id, user.user.id);
    if (data) {
      setLiked(true);
      toast("You Like the Post!");
    } else {
      setLiked(false);
      toast("You remove the like!");
    }
  }
  useEffect(() => {
    client.authed.getLikeState(user.id, user.user.id).then((res) => {
      setLiked(res);
    });
  }, [user.id]);

  return (
    <>
      <Card
        onClick={props.onClick}
        className={clsx("w-full transition-shadow duration-150 ease-in-out", props.className)}
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
              <span>{user.user.name}</span>
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
            <span className="overflow-hidden truncate"> Task {user.task?.id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.text}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
            {user.images.map((image, index) => {
              return (
                <img key={index} src={image} alt="" style={{ width: "150px", height: "150px" }} />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
