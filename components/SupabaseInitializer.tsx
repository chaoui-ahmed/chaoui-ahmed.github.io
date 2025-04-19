"use client"

import { useEffect, useState } from "react"
import { createTableIfNotExists, getAllEntries } from "@/lib/storage"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SupabaseInitializer() {
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Initialiser Supabase et créer la table si nécessaire
    const initSupabase = async () => {
      try {
        setStatus("loading")
        // Créer la table si elle n'existe pas
        const result = await createTableIfNotExists()

        if (result.success) {
          setStatus("success")
          setMessage(result.message)
          console.log("Supabase initialized successfully:", result.message)

          // Charger les entrées
          await getAllEntries()
        } else {
          setStatus("error")
          setMessage(result.message)
          console.warn("Supabase initialization failed:", result.message)
          toast({
            title: "Mode hors ligne",
            description: result.message,
            duration: 10000,
          })
        }
      } catch (error) {
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Une erreur inconnue s'est produite")
        console.error("Error initializing Supabase:", error)
      }
    }

    initSupabase()
  }, [toast])

  if (status === "loading") {
    return (
      <Alert className="fixed bottom-4 right-4 w-80 bg-blue-50 border-blue-200 text-blue-800 z-50">
        <AlertDescription>Initialisation de la base de données...</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert className="fixed bottom-4 right-4 w-80 bg-red-50 border-red-200 text-red-800 z-50">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  if (status === "success" && message) {
    return (
      <Alert className="fixed bottom-4 right-4 w-80 bg-green-50 border-green-200 text-green-800 z-50">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  return null
}
