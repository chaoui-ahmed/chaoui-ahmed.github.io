"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"

export function SignInButton() {
  const { data: session } = useSession()

  if (session) return null

  return (
    <Button
      variant="ghost"
      onClick={() => signIn("google")}
      className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
    >
      <LogIn className="mr-2 h-4 w-4" />
      Connexion
    </Button>
  )
}

export function SignOutButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <Button
      variant="ghost"
      onClick={() => signOut()}
      className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Déconnexion
    </Button>
  )
}

export function UserInfo() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="flex items-center">
      {session.user?.image && (
        <img
          src={session.user.image || "/placeholder.svg"}
          alt={session.user.name || "User"}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <span className="text-sm font-medium">{session.user?.name}</span>
    </div>
  )
}
