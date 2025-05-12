import React from "react";
import clsx from "clsx";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { TiTick } from "react-icons/ti";
import { FaRegThumbsUp } from "react-icons/fa";
import { useQuery } from "@/hooks/useQuery";
import { PostHydrated } from "@/app/moments/page";
import { client } from "@/endpoints/client";
import { toast } from "sonner";

interface Props {
  post: PostHydrated;
  className?: string;
}
export default function DetailPost(props: Props) {
  const post = props.post;
  const { data: targets } = useQuery("getTaskById", post.taskId ?? "");

  const likePost = async () => {
    await client.authed.LikePost(post.id, post.user.id);
    toast("You Like the Post!");
  };

  if (!post) return null; // safeguard

  return (
    <Card className={clsx("w-full transition-shadow", props.className)}>
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
          <FaRegThumbsUp
            onClick={() => likePost()}
            className="cursor-pointer hover:text-blue-500"
          />
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
          <span>Task {targets?.id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p>{post.text}</p>
        <div>
          <span>Complete Time: {new Date(post.updatedAt).toLocaleString()}</span>
          <h2>Task Title: {targets?.title} </h2>
          <p>Task Description: {targets?.description}</p>
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
