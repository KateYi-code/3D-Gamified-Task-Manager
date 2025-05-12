"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { client } from "@/endpoints/client"
import { useAuth } from "@/providers/auth-provider"
import { router } from "next/client";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog"
import { useMutation,useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@/hooks/useQuery"

interface Props {
  id: string
}

export default function ProfileHeader({ id }: Props) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [editOpen, setEditOpen] = useState(false)

  const { data: profile, isLoading } = useQuery("getProfile", id);

  const isMe = user?.id === id

  const queryClient = useQueryClient()

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        return await client.authed.unfollowUser(id)
      } else {
        return await client.authed.followUser(id)
      }
    },
    onSuccess: () => {
      // ✅ fresh the data after mutation
      queryClient.invalidateQueries({ queryKey: ["getProfile", id] })
      setIsFollowing((prev) => !prev)
    },
    onError: (err) => {
      console.error("Follow toggle failed:", err)
    },
  })
  useEffect(() => {

    const checkFollowing = async () => {
      if (!user || isMe) return
      try {
        const result = await client.authed.isFollowing(id)
        console.log("isFollowing =>", result)
        setIsFollowing(result)
      } catch (err) {
        console.error("Check following failed", err)
      }
    }

    checkFollowing()
  }, [id, user, isMe])

  const handleFollowToggle = () => {
    if (!user) {
      router.push("/auth")
      return
    }

    followMutation.mutate()
  }

  if (isLoading || !profile) {

    return (
      <div className="text-center text-muted-foreground py-6">
        Loading...
      </div>
    )
  }

  // const isFollowing = user?.following?.some((f) => f.id === profile.id)
  const isSelf = user?.id === profile.id

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
      <Avatar className="w-24 h-24 mx-auto sm:mx-0">
        <AvatarImage src="/avatar.png" />
        <AvatarFallback>{profile.name?.charAt(0) || "?"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold">
          {profile.name || "Undefined name"}
          <span className="ml-2 text-sm text-muted-foreground font-normal">
      @{profile.id}
    </span>
        </h1>
        <p className="text-muted-foreground text-sm">
          👥 {profile.followersCount} Followers ｜ 👣 {profile.followingCount} Following ｜ ❤️ {profile.totalLikes} Likes
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">📮: {profile.email}</p>
      </div>

      <div className="flex justify-center sm:justify-end">
        {isSelf ? (
          <Button variant="outline" onClick={() => setEditOpen(true)}>Edit Profile</Button>
        ) : (
          <Button
            variant={isFollowing ? "secondary" : "default"}
            onClick={handleFollowToggle}
            disabled={followMutation.isPending}
          >
            {followMutation.isPending
              ? "Processing..."
              : isFollowing
                ? "Unfollow"
                : "Follow"}
          </Button>
        )}
      </div>
      {isMe && profile && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          defaultValues={{ name: profile.name || "", email: profile.email }}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
