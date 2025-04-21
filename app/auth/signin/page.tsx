"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedBackground from "@/components/AnimatedBackground"
import Image from "next/image"
import { useState } from "react"
import { useSearchParams } from "next/navigation"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/"
  const error = searchParams?.get("error")

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] dark:bg-gray-900">
      <AnimatedBackground />
      <Card className="w-full max-w-md shadow-lg border-2 border-black bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sans%20titre-10-2h0y8ANkFcd9BdM3i40mHIDVvCyfDZ.png"
              alt="Camille's Pixels Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-orange-400 dark:text-orange-300">
            Bienvenue sur Camille's Pixels
          </CardTitle>
          <CardDescription className="text-black dark:text-white">
            Connectez-vous pour accéder à votre journal personnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 rounded-md">
              {error === "OAuthSignin" && "Une erreur est survenue lors de la connexion."}
              {error === "OAuthCallback" && "Une erreur est survenue lors de la connexion."}
              {error === "OAuthCreateAccount" && "Impossible de créer un compte."}
              {error === "EmailCreateAccount" && "Impossible de créer un compte."}
              {error === "Callback" && "Une erreur est survenue lors de la connexion."}
              {error === "OAuthAccountNotLinked" && "Ce compte est déjà lié à une autre méthode de connexion."}
              {error === "EmailSignin" && "Le lien de connexion n'est pas valide ou a expiré."}
              {error === "CredentialsSignin" && "Les identifiants sont incorrects."}
              {error === "SessionRequired" && "Veuillez vous connecter pour accéder à cette page."}
              {!error.match(
                /OAuthSignin|OAuthCallback|OAuthCreateAccount|EmailCreateAccount|Callback|OAuthAccountNotLinked|EmailSignin|CredentialsSignin|SessionRequired/,
              ) && "Une erreur inconnue est survenue."}
            </div>
          )}
          <div className="space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black border border-gray-300"
            >
              {isLoading ? (
                "Chargement..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="w-5 h-5"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  Se connecter avec Google
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
