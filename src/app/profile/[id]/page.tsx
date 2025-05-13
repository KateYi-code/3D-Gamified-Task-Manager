"use client";
// app/profile/[id]/page.tsx

import dynamic from "next/dynamic"
import ProfileContent from "@/components/profile/ProfileContent"
import { useParams } from "next/navigation"

const ProfileHeader = dynamic(() => import("@/components/profile/ProfileHeader"), { ssr: false })

export default function ProfilePage() {
  const { id } = useParams() as { id: string }

  if (!id) return <div>Loading...</div>

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-8 bg-white dark:bg-black">
      <ProfileHeader id={id}/>
      <ProfileContent id={id}/>
      {/*<ProfileContent id={params.id}/>*/}
    </main>
  )
}
