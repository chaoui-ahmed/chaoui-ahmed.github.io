"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check if environment variables are defined (not their values)
    const checkEnv = async () => {
      const response = await fetch("/api/check-env")
      const data = await response.json()
      setEnvStatus(data)
    }

    checkEnv()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Environment Variables Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(envStatus).map(([key, exists]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{key}</span>
                <span className={exists ? "text-green-500" : "text-red-500"}>{exists ? "✓" : "✗"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
