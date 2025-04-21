"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (isClient && status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router, isClient])

  if (!isClient || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-4 text-black dark:text-white">Chargement...</p>
        </div>
      </div>
    )
  }

  if (status === "authenticated") {
    return <>{children}</>
  }

  return null
}
