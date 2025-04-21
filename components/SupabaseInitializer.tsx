"use client"

import { useEffect, useState } from "react"
import { checkTableExists, getAllEntries } from "@/lib/storage"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SupabaseInitializer() {
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "offline">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Initialiser Supabase et vérifier si la table existe
    const initSupabase = async () => {
      try {
        setStatus("loading")
        // Vérifier si la table existe
        const tableExists = await checkTableExists()

        if (tableExists) {
          setStatus("success")
          setMessage("Connexion à Supabase établie avec succès.")
          console.log("Supabase table exists, loading entries")

          // Charger les entrées
          await getAllEntries()
        } else {
          setStatus("offline")
          setMessage("Mode hors ligne : vos données sont stockées localement.")
          console.log("Supabase table does not exist, using local storage only")
        }
      } catch (error) {
        setStatus("offline")
        setMessage("Mode hors ligne : vos données sont stockées localement.")
        console.log("Error connecting to Supabase, using local storage only:", error)
      }
    }

    initSupabase()
  }, [toast])

  if (status === "loading") {
    return (
      <Alert className="fixed bottom-4 right-4 w-80 bg-blue-50 border-blue-200 text-blue-800 z-50">
        <AlertDescription>Initialisation de l'application...</AlertDescription>
      </Alert>
    )
  }

  if (status === "offline") {
    return (
      <Alert className="fixed bottom-4 right-4 w-80 bg-orange-50 border-orange-200 text-orange-800 z-50">
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
