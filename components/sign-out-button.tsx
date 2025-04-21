"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

export function SignOutButton() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: "/auth/signin" })
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
    >
      {isLoading ? (
        "Chargement..."
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </>
      )}
    </Button>
  )
}
