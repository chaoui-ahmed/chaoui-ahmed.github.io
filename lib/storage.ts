import type { JournalEntry } from "@/types/JournalEntry"
import { createClient } from "@/utils/supabase/client"

const CACHE_KEY = "journal_entries_cache"
const SUPABASE_ENABLED_KEY = "supabase_enabled"

// Fonction pour récupérer le client Supabase
const getSupabase = () => createClient()

// Fonctions de cache local
const cacheEntries = (entries: JournalEntry[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries))
  }
}

const getCachedEntries = (): JournalEntry[] => {
  if (typeof window === "undefined") return []
  const cached = localStorage.getItem(CACHE_KEY)
  return cached ? JSON.parse(cached) : []
}

// Fonction pour vérifier si Supabase est activé
const isSupabaseEnabled = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem(SUPABASE_ENABLED_KEY) === "true"
}

// Fonction pour définir si Supabase est activé
const setSupabaseEnabled = (enabled: boolean) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(SUPABASE_ENABLED_KEY, enabled ? "true" : "false")
  }
}

// Fonction pour vérifier si la table existe
export const checkTableExists = async (): Promise<boolean> => {
  try {
    // Si Supabase est désactivé, retourner false immédiatement
    if (!isSupabaseEnabled()) {
      console.log("Supabase is disabled, using local storage only")
      return false
    }

    const supabase = getSupabase()

    // Afficher les informations de connexion pour le débogage (sans les valeurs sensibles)
    console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // Vérifier si la table existe déjà en essayant de récupérer une entrée
    console.log("Checking if journal_entries table exists...")
    try {
      const { data, error } = await supabase.from("journal_entries").select("id").limit(1)

      // Si une erreur se produit, afficher les détails
      if (error) {
        console.log("Table access error:", error.message, error.code, error.details)
        setSupabaseEnabled(false)
        return false
      }

      console.log("Table journal_entries exists and is accessible, data:", data)
      setSupabaseEnabled(true)
      return true
    } catch (queryError) {
      console.log("Query error:", queryError)
      setSupabaseEnabled(false)
      return false
    }
  } catch (error) {
    console.log("Error checking table:", error)
    setSupabaseEnabled(false)
    return false
  }
}

export const saveEntry = async (entry: JournalEntry) => {
  // Sauvegarder d'abord dans le cache local
  const cachedEntries = getCachedEntries()
  const existingEntryIndex = cachedEntries.findIndex((e) => e.id === entry.id)

  if (existingEntryIndex >= 0) {
    cachedEntries[existingEntryIndex] = entry
  } else {
    cachedEntries.push(entry)
  }

  cacheEntries(cachedEntries)
  console.log("Entry saved to local cache")

  // Essayer de sauvegarder dans Supabase si activé
  try {
    // Vérifier si la table existe
    const tableExists = await checkTableExists()

    // Si la table n'existe pas, on utilise uniquement le stockage local
    if (!tableExists) {
      return
    }

    const supabase = getSupabase()
    console.log("Saving entry to Supabase:", entry.id)

    // Insérer l'entrée dans Supabase
    const { error } = await supabase.from("journal_entries").upsert({
      id: entry.id,
      content: entry.content,
      mood: entry.mood,
      hashtags: entry.hashtags,
      date: entry.date,
      photos: entry.photos || [],
    })

    if (error) {
      console.log("Error saving to Supabase, using local storage only:", error.message)
      return
    }

    console.log("Entry saved successfully to Supabase")
  } catch (error) {
    console.log("Error saving to Supabase, using local storage only:", error)
  }
}

export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    // Vérifier si la table existe
    const tableExists = await checkTableExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableExists) {
      const cachedEntries = getCachedEntries()
      console.log(`Retrieved ${cachedEntries.length} entries from local cache`)
      return cachedEntries
    }

    const supabase = getSupabase()
    console.log("Fetching all entries from Supabase...")

    // Récupérer toutes les entrées depuis Supabase
    const { data, error } = await supabase.from("journal_entries").select("*").order("date", { ascending: false })

    if (error) {
      console.log("Error fetching from Supabase, using local cache:", error.message)
      const cachedEntries = getCachedEntries()
      return cachedEntries
    }

    console.log(`Retrieved ${data.length} entries from Supabase`)

    // Mettre à jour le cache local
    cacheEntries(data)
    return data
  } catch (error) {
    console.log("Error fetching entries, using local cache:", error)
    const cachedEntries = getCachedEntries()
    return cachedEntries
  }
}

export const searchEntriesByHashtag = async (hashtag: string): Promise<JournalEntry[]> => {
  try {
    // Vérifier si la table existe
    const tableExists = await checkTableExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableExists) {
      const cachedEntries = getCachedEntries()
      const filteredEntries = cachedEntries.filter((entry) =>
        entry.hashtags.some((tag) => tag.toLowerCase().includes(hashtag.toLowerCase())),
      )
      console.log(`Found ${filteredEntries.length} entries with hashtag: ${hashtag} in local cache`)
      return filteredEntries
    }

    const supabase = getSupabase()

    // Rechercher les entrées par hashtag dans Supabase
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .contains("hashtags", [hashtag])
      .order("date", { ascending: false })

    if (error) {
      console.log("Error searching in Supabase, using local cache:", error.message)
      const cachedEntries = getCachedEntries()
      const filteredEntries = cachedEntries.filter((entry) =>
        entry.hashtags.some((tag) => tag.toLowerCase().includes(hashtag.toLowerCase())),
      )
      return filteredEntries
    }

    console.log(`Found ${data.length} entries with hashtag: ${hashtag}`)
    return data
  } catch (error) {
    console.log("Error searching entries, using local cache:", error)
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) =>
      entry.hashtags.some((tag) => tag.toLowerCase().includes(hashtag.toLowerCase())),
    )
    return filteredEntries
  }
}

export const searchEntriesByContent = async (term: string): Promise<JournalEntry[]> => {
  try {
    // Vérifier si la table existe
    const tableExists = await checkTableExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableExists) {
      const cachedEntries = getCachedEntries()
      const filteredEntries = cachedEntries.filter((entry) => entry.content.toLowerCase().includes(term.toLowerCase()))
      console.log(`Found ${filteredEntries.length} entries containing: ${term} in local cache`)
      return filteredEntries
    }

    const supabase = getSupabase()

    // Rechercher les entrées par contenu dans Supabase
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .ilike("content", `%${term}%`)
      .order("date", { ascending: false })

    if (error) {
      console.log("Error searching in Supabase, using local cache:", error.message)
      const cachedEntries = getCachedEntries()
      const filteredEntries = cachedEntries.filter((entry) => entry.content.toLowerCase().includes(term.toLowerCase()))
      return filteredEntries
    }

    console.log(`Found ${data.length} entries containing: ${term}`)
    return data
  } catch (error) {
    console.log("Error searching entries, using local cache:", error)
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) => entry.content.toLowerCase().includes(term.toLowerCase()))
    return filteredEntries
  }
}

export const getEntriesByDate = async (date: Date): Promise<JournalEntry[]> => {
  try {
    // Vérifier si la table existe
    const tableExists = await checkTableExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableExists) {
      const cachedEntries = getCachedEntries()
      const filteredEntries = cachedEntries.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate.toDateString() === date.toDateString()
      })
      console.log(
        `Found ${filteredEntries.length} entries for date: ${date.toISOString().split("T")[0]} in local cache`,
      )
      return filteredEntries
    }

    const supabase = getSupabase()

    // Formater la date pour la requête
    const dateString = date.toISOString().split("T")[0]

    // Récupérer les entrées par date dans Supabase
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .gte("date", `${dateString}T00:00:00Z`)
      .lt("date", `${dateString}T23:59:59Z`)
      .order("date", { ascending: false })

    if (error) {
      console.log("Error fetching from Supabase, using local cache:", error.message)
      const cachedEntries = getCachedEntries()
      const filteredEntries = cachedEntries.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate.toDateString() === date.toDateString()
      })
      return filteredEntries
    }

    console.log(`Found ${data.length} entries for date: ${dateString}`)
    return data
  } catch (error) {
    console.log("Error fetching entries, using local cache:", error)
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate.toDateString() === date.toDateString()
    })
    return filteredEntries
  }
}

export const saveDraft = (key: string, value: any) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(`draft:${key}`, JSON.stringify(value))
      console.log(`Draft saved for key: ${key}`)
    }
  } catch (error) {
    console.error("Error saving draft:", error)
  }
}

export const loadDraft = (key: string) => {
  try {
    if (typeof window === "undefined") return null
    const draft = localStorage.getItem(`draft:${key}`)
    console.log(`Draft loaded for key: ${key}`)
    return draft ? JSON.parse(draft) : null
  } catch (error) {
    console.error("Error loading draft:", error)
    return null
  }
}

// Fonction pour synchroniser les entrées locales avec Supabase
export const syncLocalEntriesToSupabase = async () => {
  try {
    // Vérifier si la table existe
    const tableExists = await checkTableExists()

    // Si la table n'existe pas, on ne peut pas synchroniser
    if (!tableExists) {
      console.log("Table does not exist, cannot sync")
      return
    }

    const supabase = getSupabase()
    const localEntries = getCachedEntries()
    if (localEntries.length === 0) return

    console.log(`Syncing ${localEntries.length} local entries to Supabase`)

    // Utiliser upsert pour ajouter ou mettre à jour les entrées
    const { error } = await supabase.from("journal_entries").upsert(localEntries)

    if (error) {
      console.log("Error syncing to Supabase:", error.message)
      return
    }

    console.log("Local entries successfully synced to Supabase")
  } catch (error) {
    console.log("Error syncing entries:", error)
  }
}
