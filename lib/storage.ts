import type { JournalEntry } from "@/types/JournalEntry"
import { getSupabaseClient } from "./supabase"

const CACHE_KEY = "journal_entries_cache"

// Fonction pour récupérer le client Supabase
const getSupabase = () => getSupabaseClient()

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

// Fonction pour vérifier si la table existe et configurer les politiques d'accès
export const createTableIfNotExists = async () => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe déjà en essayant de récupérer une entrée
    console.log("Checking if journal_entries table exists...")
    const { data, error: checkError } = await supabase.from("journal_entries").select("id").limit(1)

    console.log("Check result:", { data, error: checkError ? checkError.message : null })

    // Si la table n'existe pas ou s'il y a une erreur d'accès
    if (checkError) {
      if (checkError.message.includes("does not exist")) {
        console.log("Table journal_entries does not exist, using local storage only")
        return false
      }

      // Si l'erreur est liée aux permissions
      if (checkError.message.includes("permission") || checkError.message.includes("access")) {
        console.log("Permission error accessing journal_entries table:", checkError.message)
        console.log("Please check your Row Level Security (RLS) policies in Supabase")
        return false
      }

      console.log("Unknown error accessing journal_entries table:", checkError.message)
      return false
    }

    console.log("Table journal_entries exists and is accessible")
    return true
  } catch (error) {
    console.error("Error checking table:", error)
    return false
  }
}

export const saveEntry = async (entry: JournalEntry) => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe
    const tableExists = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise uniquement le stockage local
    if (!tableExists) {
      throw new Error("Table does not exist or is not accessible")
    }

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
      console.error("Error in upsert operation:", error.message)
      throw error
    }

    console.log("Entry saved successfully to Supabase")

    // Mettre à jour le cache local
    const cachedEntries = getCachedEntries()
    const existingEntryIndex = cachedEntries.findIndex((e) => e.id === entry.id)

    if (existingEntryIndex >= 0) {
      cachedEntries[existingEntryIndex] = entry
    } else {
      cachedEntries.push(entry)
    }

    cacheEntries(cachedEntries)
  } catch (error) {
    console.error("Error saving entry to Supabase:", error)
    // Fallback vers le stockage local
    const cachedEntries = getCachedEntries()
    const existingEntryIndex = cachedEntries.findIndex((e) => e.id === entry.id)

    if (existingEntryIndex >= 0) {
      cachedEntries[existingEntryIndex] = entry
    } else {
      cachedEntries.push(entry)
    }

    cacheEntries(cachedEntries)
    console.log("Entry saved to local cache")
  }
}

export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe
    const tableExists = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableExists) {
      throw new Error("Table does not exist or is not accessible")
    }

    console.log("Fetching all entries from Supabase...")

    // Récupérer toutes les entrées depuis Supabase
    const { data, error } = await supabase.from("journal_entries").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Error in select operation:", error.message)
      throw error
    }

    console.log(`Retrieved ${data.length} entries from Supabase`)

    // Mettre à jour le cache local
    cacheEntries(data)
    return data
  } catch (error) {
    console.error("Error getting entries from Supabase:", error)
    // Fallback vers le cache local
    const cachedEntries = getCachedEntries()
    console.log(`Retrieved ${cachedEntries.length} entries from local cache`)
    return cachedEntries
  }
}

// Les autres fonctions restent inchangées...

export const searchEntriesByHashtag = async (hashtag: string): Promise<JournalEntry[]> => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe
    const tableExists = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableExists) {
      throw new Error("Table does not exist or is not accessible")
    }

    // Rechercher les entrées par hashtag dans Supabase
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .contains("hashtags", [hashtag])
      .order("date", { ascending: false })

    if (error) throw error

    console.log(`Found ${data.length} entries with hashtag: ${hashtag}`)
    return data
  } catch (error) {
    console.error("Error searching entries by hashtag:", error)
    // Fallback vers le cache local
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) =>
      entry.hashtags.some((tag) => tag.toLowerCase().includes(hashtag.toLowerCase())),
    )
    console.log(`Found ${filteredEntries.length} entries with hashtag: ${hashtag} in local cache`)
    return filteredEntries
  }
}

export const searchEntriesByContent = async (term: string): Promise<JournalEntry[]> => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe
    const tableExists = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableExists) {
      throw new Error("Table does not exist or is not accessible")
    }

    // Rechercher les entrées par contenu dans Supabase
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .ilike("content", `%${term}%`)
      .order("date", { ascending: false })

    if (error) throw error

    console.log(`Found ${data.length} entries containing: ${term}`)
    return data
  } catch (error) {
    console.error("Error searching entries by content:", error)
    // Fallback vers le cache local
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) => entry.content.toLowerCase().includes(term.toLowerCase()))
    console.log(`Found ${filteredEntries.length} entries containing: ${term} in local cache`)
    return filteredEntries
  }
}

export const getEntriesByDate = async (date: Date): Promise<JournalEntry[]> => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe
    const tableExists = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableExists) {
      throw new Error("Table does not exist or is not accessible")
    }

    // Formater la date pour la requête
    const dateString = date.toISOString().split("T")[0]

    // Récupérer les entrées par date dans Supabase
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .gte("date", `${dateString}T00:00:00Z`)
      .lt("date", `${dateString}T23:59:59Z`)
      .order("date", { ascending: false })

    if (error) throw error

    console.log(`Found ${data.length} entries for date: ${dateString}`)
    return data
  } catch (error) {
    console.error("Error getting entries by date:", error)
    // Fallback vers le cache local
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate.toDateString() === date.toDateString()
    })
    console.log(`Found ${filteredEntries.length} entries for date: ${date.toISOString().split("T")[0]} in local cache`)
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
    const supabase = getSupabase()
    const localEntries = getCachedEntries()
    if (localEntries.length === 0) return

    // Vérifier si la table existe
    const tableExists = await createTableIfNotExists()

    // Si la table n'existe pas, on ne peut pas synchroniser
    if (!tableExists) {
      throw new Error("Table does not exist or is not accessible")
    }

    console.log(`Syncing ${localEntries.length} local entries to Supabase`)

    // Utiliser upsert pour ajouter ou mettre à jour les entrées
    const { error } = await supabase.from("journal_entries").upsert(localEntries)

    if (error) throw error

    console.log("Local entries successfully synced to Supabase")
  } catch (error) {
    console.error("Error syncing local entries to Supabase:", error)
  }
}
