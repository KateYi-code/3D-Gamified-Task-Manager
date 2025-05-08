"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { client } from "@/endpoints/client"
import { useAuth } from "@/providers/auth-provider"
import { router } from "next/client";


interface ProfileData {
  id: string
  name: string | null
  email: string
  followersCount: number
  followingCount: number
  totalLikes: number
}

interface Props {
  id: string
}

export default function ProfileHeader({ id }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [followLoading, setFollowLoading] = useState(false)

  const isMe = user?.id === id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await client.unauth.getProfile(id)
        setProfile(data)
      } catch (err) {
        console.error("Get profile failed", err)
      } finally {
        setLoading(false)
      }
    }
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

    fetchProfile()
    checkFollowing()
  }, [id, user, isMe])

  const handleFollowToggle = async () => {
    if (!user) {
      router.push("/auth")
      return
    }

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await client.authed.unfollowUser(id)
        setIsFollowing(false)
        setProfile((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount - 1 } : prev
        )
      } else {
        await client.authed.followUser(id)
        setIsFollowing(true)
        setProfile((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev
        )
      }
    } catch (err) {
      console.error("Toggle follow failed:", err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading || !profile) {
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
        <h1 className="text-2xl font-bold">{profile.name || "Undefined name"}</h1>
        <p className="text-muted-foreground text-sm">
          👥 {profile.followersCount} Followers ｜ 👣 {profile.followingCount} Following ｜ ❤️ {profile.totalLikes} Likes
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">📮: {profile.email}</p>
      </div>

      <div className="flex justify-center sm:justify-end">
        {isSelf ? (
          <Button variant="outline">Edit Profile</Button>
        ) : (
          <Button
            variant={isFollowing ? "secondary" : "default"}
            onClick={handleFollowToggle}
            disabled={followLoading}
          >
            {followLoading
              ? "Loading..."
              : isFollowing
                ? "Unfollow"
                : "Follow"}
          </Button>
        )}
      </div>
    </div>
  )
}
