import React from 'react'
import clsx from "clsx"

// import UI components
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Description } from '@radix-ui/react-dialog'
// import icons
import { TiTick } from "react-icons/ti";
import { FaRegThumbsUp } from "react-icons/fa";
// import packages
import { useQuery } from '@/hooks/useQuery';

export default function detailPost(props) {
    const post = props.post;
    if (!post) return null; // safeguard

    const { data: targets } = useQuery("getTaskById", post.taskId);

    return (
        <Card className={clsx("w-full transition-shadow", props.className)}>
            <CardHeader>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "pink" }} />
                        <span>{post.user?.name}</span>
                    </div>
                    <FaRegThumbsUp />
                </div>
                <CardDescription style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1px solid", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <TiTick />
                    </div>
                    <span>Task {targets?.id}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-5'>
                <p>{post.text}</p>
                <div>
                    <span>Complete Time: {new Date(post.updatedAt).toLocaleString()}</span>
                    <h2>Task Title: {targets?.title} </h2>
                    <p>Task Description: {targets?.description}</p>
                </div>
                <div style={{ display: "flex", gap: "10px", overflowX: "scroll", marginTop: "10px" }}>
                    {post.images?.map((src, index) => (
                        <img key={index} src={src} alt="" style={{ width: "150px", height: "150px" }} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
