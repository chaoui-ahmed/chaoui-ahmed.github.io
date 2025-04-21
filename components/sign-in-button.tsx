"use client"

import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useState } from "react"

export function SignInButton() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  if (session) {
    return null
  }

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google")
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignIn}
      disabled={isLoading}
      className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
    >
      {isLoading ? (
        "Chargement..."
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Connexion
        </>
      )}
    </Button>
  )
}
