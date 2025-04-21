"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function AuthTest() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">NextAuth.js Test Page</h1>

        <div className="mb-4 p-4 bg-gray-50 rounded border">
          <h2 className="font-semibold mb-2">Session Status: {status}</h2>
          {session ? (
            <div>
              <p>Signed in as: {session.user?.email}</p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          ) : (
            <p>Not signed in</p>
          )}
        </div>

        <div className="flex gap-2">
          {!session ? (
            <Button onClick={() => signIn("google")}>Sign in with Google</Button>
          ) : (
            <Button onClick={() => signOut()}>Sign out</Button>
          )}
        </div>
      </div>
    </div>
  )
}
