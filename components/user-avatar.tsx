"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserAvatar() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <Avatar className="h-8 w-8 mr-2">
      <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
      <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
    </Avatar>
  )
}
