import type { JournalEntry } from "@/types/JournalEntry"
import { createClient } from "@/utils/supabase/client"

const CACHE_KEY = "journal_entries_cache"

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

// Fonction pour créer la table si elle n'existe pas
export const createTableIfNotExists = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe déjà
    console.log("Checking if journal_entries table exists...")
    const { error: checkError } = await supabase.from("journal_entries").select("id").limit(1)

    // Si la table n'existe pas, on la crée
    if (checkError && checkError.message.includes("does not exist")) {
      console.log("Table journal_entries does not exist, creating it...")

      // Créer la table avec SQL
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS journal_entries (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            mood TEXT NOT NULL,
            hashtags TEXT[] NOT NULL,
            date TIMESTAMPTZ NOT NULL,
            photos TEXT[] DEFAULT '{}'
          );
          
          -- Créer un index sur la date
          CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON journal_entries(date);
          
          -- Activer RLS
          ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
          
          -- Créer une politique pour permettre toutes les opérations
          CREATE POLICY "Enable all operations for all users" ON journal_entries
            USING (true)
            WITH CHECK (true);
        `,
      })

      if (createError) {
        console.error("Error creating table:", createError)

        // Si l'erreur est liée aux permissions
        if (createError.message.includes("permission") || createError.message.includes("access")) {
          return {
            success: false,
            message: "Vous n'avez pas les permissions nécessaires pour créer la table. Veuillez la créer manuellement.",
          }
        }

        // Si la fonction RPC n'existe pas
        if (createError.message.includes("function") && createError.message.includes("does not exist")) {
          return {
            success: false,
            message: "La fonction exec_sql n'existe pas. Veuillez créer la table manuellement.",
          }
        }

        return {
          success: false,
          message: `Erreur lors de la création de la table: ${createError.message}`,
        }
      }

      console.log("Table journal_entries created successfully")
      return {
        success: true,
        message: "Table journal_entries créée avec succès.",
      }
    } else if (checkError) {
      // Si l'erreur est liée aux permissions
      if (checkError.message.includes("permission") || checkError.message.includes("access")) {
        console.log("Permission error accessing journal_entries table:", checkError.message)
        return {
          success: false,
          message:
            "Vous n'avez pas les permissions nécessaires pour accéder à la table. Veuillez configurer les politiques RLS.",
        }
      }

      console.log("Unknown error accessing journal_entries table:", checkError.message)
      return {
        success: false,
        message: `Erreur lors de l'accès à la table: ${checkError.message}`,
      }
    }

    console.log("Table journal_entries exists and is accessible")
    return {
      success: true,
      message: "Table journal_entries existe et est accessible.",
    }
  } catch (error) {
    console.error("Error checking/creating table:", error)
    return {
      success: false,
      message: `Erreur lors de la vérification/création de la table: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Fonction pour créer la table manuellement avec SQL brut
export const createTableManually = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const supabase = getSupabase()

    // Utiliser l'API REST pour exécuter du SQL brut
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        query: `
          CREATE TABLE IF NOT EXISTS journal_entries (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            mood TEXT NOT NULL,
            hashtags TEXT[] NOT NULL,
            date TIMESTAMPTZ NOT NULL,
            photos TEXT[] DEFAULT '{}'
          );
          
          -- Créer un index sur la date
          CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON journal_entries(date);
          
          -- Activer RLS
          ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
          
          -- Créer une politique pour permettre toutes les opérations
          CREATE POLICY "Enable all operations for all users" ON journal_entries
            USING (true)
            WITH CHECK (true);
        `,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error creating table with REST API:", errorText)
      return {
        success: false,
        message: `Erreur lors de la création de la table: ${errorText}`,
      }
    }

    console.log("Table journal_entries created successfully with REST API")
    return {
      success: true,
      message: "Table journal_entries créée avec succès.",
    }
  } catch (error) {
    console.error("Error creating table manually:", error)
    return {
      success: false,
      message: `Erreur lors de la création manuelle de la table: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export const saveEntry = async (entry: JournalEntry) => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe
    const tableCheck = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise uniquement le stockage local
    if (!tableCheck.success) {
      throw new Error(tableCheck.message)
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
    const tableCheck = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableCheck.success) {
      throw new Error(tableCheck.message)
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

export const searchEntriesByHashtag = async (hashtag: string): Promise<JournalEntry[]> => {
  try {
    const supabase = getSupabase()

    // Vérifier si la table existe
    const tableCheck = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableCheck.success) {
      throw new Error(tableCheck.message)
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
    const tableCheck = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableCheck.success) {
      throw new Error(tableCheck.message)
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
    const tableCheck = await createTableIfNotExists()

    // Si la table n'existe pas, on utilise le cache local
    if (!tableCheck.success) {
      throw new Error(tableCheck.message)
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
    const tableCheck = await createTableIfNotExists()

    // Si la table n'existe pas, on ne peut pas synchroniser
    if (!tableCheck.success) {
      throw new Error(tableCheck.message)
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
