"use client"

import { useEffect } from "react"
import { createTableIfNotExists, getAllEntries } from "@/lib/storage"
import { useToast } from "@/components/ui/use-toast"

export default function SupabaseInitializer() {
  const { toast } = useToast()

  useEffect(() => {
    // Initialiser Supabase et vérifier si la table existe
    const initSupabase = async () => {
      try {
        // Vérifier si la table existe
        const tableExists = await createTableIfNotExists()

        if (tableExists) {
          console.log("Supabase table exists, loading entries")
          // Charger les entrées
          await getAllEntries()
        } else {
          console.warn("Supabase table does not exist, using local storage only")
          toast({
            title: "Configuration requise",
            description: "Veuillez créer la table 'journal_entries' dans Supabase pour activer la synchronisation.",
            duration: 10000,
          })
        }
      } catch (error) {
        console.error("Error initializing Supabase:", error)
      }
    }

    initSupabase()
  }, [toast])

  // Ce composant ne rend rien visuellement
  return null
}
