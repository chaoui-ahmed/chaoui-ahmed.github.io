import { createClient } from "@supabase/supabase-js"
import type { JournalEntry } from "@/types/JournalEntry"

// Configuration Supabase (à remplacer par vos propres valeurs)
const supabaseUrl = "YOUR_SUPABASE_URL"
const supabaseKey = "YOUR_SUPABASE_KEY"
const supabase = createClient(supabaseUrl, supabaseKey)

const ACCESS_CODE_KEY = "journal_access_code"

// Fonctions pour le code d'accès
export const getAccessCode = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_CODE_KEY)
}

export const setAccessCode = (code: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_CODE_KEY, code)
  }
}

export const validateAccessCode = async (code: string): Promise<boolean> => {
  setAccessCode(code)
  return true
}

// Fonction pour récupérer toutes les entrées
export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) return []

    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("access_code", accessCode)
      .order("date", { ascending: false })

    if (error) {
      throw error
    }

    // Convertir les données de Supabase au format JournalEntry
    return data.map((item) => ({
      id: item.id,
      content: item.content,
      mood: item.mood,
      hashtags: item.hashtags,
      date: item.date,
      photos: item.photos || [],
    }))
  } catch (error) {
    console.error("Error getting entries from Supabase:", error)
    return []
  }
}

// Fonction pour sauvegarder une entrée
export const saveEntry = async (entry: JournalEntry): Promise<void> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    const { error } = await supabase.from("entries").upsert({
      id: entry.id,
      access_code: accessCode,
      content: entry.content,
      mood: entry.mood,
      hashtags: entry.hashtags,
      date: entry.date,
      photos: entry.photos || [],
    })

    if (error) {
      throw error
    }

    console.log("Entry saved to Supabase")
  } catch (error) {
    console.error("Error saving entry to Supabase:", error)
    throw error
  }
}

// Fonction pour supprimer une entrée
export const deleteEntry = async (entryId: string): Promise<void> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    const { error } = await supabase.from("entries").delete().eq("id", entryId).eq("access_code", accessCode)

    if (error) {
      throw error
    }

    console.log("Entry deleted from Supabase")
  } catch (error) {
    console.error("Error deleting entry from Supabase:", error)
    throw error
  }
}

// Fonction pour rechercher des entrées par hashtag
export const searchEntriesByHashtag = async (hashtag: string): Promise<JournalEntry[]> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) return []

    // Supabase permet de rechercher dans des tableaux avec l'opérateur ?
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("access_code", accessCode)
      .filter("hashtags", "cs", `{${hashtag}}`)
      .order("date", { ascending: false })

    if (error) {
      throw error
    }

    return data.map((item) => ({
      id: item.id,
      content: item.content,
      mood: item.mood,
      hashtags: item.hashtags,
      date: item.date,
      photos: item.photos || [],
    }))
  } catch (error) {
    console.error("Error searching entries by hashtag:", error)
    return []
  }
}

// Fonction pour rechercher des entrées par contenu
export const searchEntriesByContent = async (term: string): Promise<JournalEntry[]> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) return []

    // Supabase permet la recherche de texte avec l'opérateur ilike
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("access_code", accessCode)
      .ilike("content", `%${term}%`)
      .order("date", { ascending: false })

    if (error) {
      throw error
    }

    return data.map((item) => ({
      id: item.id,
      content: item.content,
      mood: item.mood,
      hashtags: item.hashtags,
      date: item.date,
      photos: item.photos || [],
    }))
  } catch (error) {
    console.error("Error searching entries by content:", error)
    return []
  }
}

// Fonction pour récupérer des entrées par date
export const getEntriesByDate = async (date: Date): Promise<JournalEntry[]> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) return []

    const dateStr = date.toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("access_code", accessCode)
      .gte("date", `${dateStr}T00:00:00`)
      .lt("date", `${dateStr}T23:59:59`)
      .order("date", { ascending: false })

    if (error) {
      throw error
    }

    return data.map((item) => ({
      id: item.id,
      content: item.content,
      mood: item.mood,
      hashtags: item.hashtags,
      date: item.date,
      photos: item.photos || [],
    }))
  } catch (error) {
    console.error("Error getting entries by date:", error)
    return []
  }
}

// Fonctions pour les brouillons
export const saveDraft = (key: string, value: any): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(`draft:${key}`, JSON.stringify(value))
}

export const loadDraft = (key: string): any => {
  if (typeof window === "undefined") return null
  const draft = localStorage.getItem(`draft:${key}`)
  return draft ? JSON.parse(draft) : null
}

// Fonction pour télécharger une photo
export const uploadPhoto = async (file: File, entryId: string): Promise<string> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    const timestamp = Date.now()
    const filePath = `photos/${accessCode}/${entryId}/${timestamp}-${file.name}`

    // Télécharger le fichier dans Supabase Storage
    const { data, error } = await supabase.storage.from("journal").upload(filePath, file)

    if (error) {
      throw error
    }

    // Obtenir l'URL publique du fichier
    const { data: urlData } = supabase.storage.from("journal").getPublicUrl(filePath)

    console.log("Photo uploaded to Supabase Storage:", urlData.publicUrl)
    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading photo to Supabase Storage:", error)
    throw error
  }
}

// Fonction pour exporter toutes les données
export const exportData = async (): Promise<string> => {
  const entries = await getAllEntries()
  return JSON.stringify(entries)
}

// Fonction pour importer des données
export const importData = async (jsonData: string): Promise<void> => {
  try {
    const entries = JSON.parse(jsonData) as JournalEntry[]
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    for (const entry of entries) {
      await saveEntry(entry)
    }

    console.log(`Imported ${entries.length} entries to Supabase`)
  } catch (error) {
    console.error("Error importing data to Supabase:", error)
    throw error
  }
}
