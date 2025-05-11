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
import { client } from "@/endpoints/client"

export default function SinglePost(props) {
    // var user = {
    //     name: "David Jones",
    //     taskID: "111111111",
    //     Description: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    //     images: [1, 2, 3, 4, 5]
    // }
    const user = props.post
    async function likePost(e) {
        e.stopPropagation();
        const data = await client.authed.LikePost(user.id, user.user.id);
        alert("Post liked successfully");
    };
    return (
        <Card onClick={props.onClick}
            className={clsx(
                "w-full transition-shadow duration-150 ease-in-out",
                props.className)}>
            <CardHeader>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "Top", gap: "10px" }}>

                        <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "pink", display: 'inline-block', marginLeft: "-14px" }}></div>
                        <span >{user.user.name}</span>
                    </div>
                    <FaRegThumbsUp onClick={(e) => likePost(e)} className="cursor-pointer hover:text-blue-500" />
                </div>
                <CardDescription style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1px solid", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <TiTick />
                    </div>
                    <span className='overflow-hidden truncate'> Task {user.task?.id}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {user.text}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                    {user.images.map((image, index) => {
                        return (
                            <img key={index} src={image} alt="" style={{ width: "150px", height: "150px" }} />
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
