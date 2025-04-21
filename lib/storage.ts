import type { JournalEntry } from "@/types/JournalEntry"
import { saveEntryToBlob, getAllEntriesFromBlob, uploadPhotoToBlob } from "@/lib/blob-storage"

const CACHE_KEY = "journal_entries_cache"

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

// Fonction pour sauvegarder une entrée
export const saveEntry = async (entry: JournalEntry) => {
  try {
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

    // Sauvegarder dans Blob Storage
    await saveEntryToBlob(entry)
    console.log("Entry saved to Blob Storage")
  } catch (error) {
    console.error("Error saving entry to Blob Storage:", error)
    // Déjà sauvegardé dans le cache local, donc pas besoin de le refaire
  }
}

// Fonction pour récupérer toutes les entrées
export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    // Essayer de récupérer depuis Blob Storage
    const entries = await getAllEntriesFromBlob()
    console.log(`Retrieved ${entries.length} entries from Blob Storage`)

    // Mettre à jour le cache local
    cacheEntries(entries)
    return entries
  } catch (error) {
    console.error("Error getting entries from Blob Storage:", error)
    // Fallback vers le cache local
    const cachedEntries = getCachedEntries()
    console.log(`Retrieved ${cachedEntries.length} entries from local cache`)
    return cachedEntries
  }
}

// Fonction pour rechercher des entrées par hashtag
export const searchEntriesByHashtag = async (hashtag: string): Promise<JournalEntry[]> => {
  try {
    // Récupérer toutes les entrées
    const allEntries = await getAllEntries()

    // Filtrer par hashtag
    const filteredEntries = allEntries.filter((entry) =>
      entry.hashtags.some((tag) => tag.toLowerCase().includes(hashtag.toLowerCase())),
    )

    console.log(`Found ${filteredEntries.length} entries with hashtag: ${hashtag}`)
    return filteredEntries
  } catch (error) {
    console.error("Error searching entries by hashtag:", error)
    // Fallback vers le cache local
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) =>
      entry.hashtags.some((tag) => tag.toLowerCase().includes(hashtag.toLowerCase())),
    )
    return filteredEntries
  }
}

// Fonction pour rechercher des entrées par contenu
export const searchEntriesByContent = async (term: string): Promise<JournalEntry[]> => {
  try {
    // Récupérer toutes les entrées
    const allEntries = await getAllEntries()

    // Filtrer par contenu
    const filteredEntries = allEntries.filter((entry) => entry.content.toLowerCase().includes(term.toLowerCase()))

    console.log(`Found ${filteredEntries.length} entries containing: ${term}`)
    return filteredEntries
  } catch (error) {
    console.error("Error searching entries by content:", error)
    // Fallback vers le cache local
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) => entry.content.toLowerCase().includes(term.toLowerCase()))
    return filteredEntries
  }
}

// Fonction pour récupérer des entrées par date
export const getEntriesByDate = async (date: Date): Promise<JournalEntry[]> => {
  try {
    // Récupérer toutes les entrées
    const allEntries = await getAllEntries()

    // Filtrer par date
    const filteredEntries = allEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate.toDateString() === date.toDateString()
    })

    console.log(`Found ${filteredEntries.length} entries for date: ${date.toISOString().split("T")[0]}`)
    return filteredEntries
  } catch (error) {
    console.error("Error getting entries by date:", error)
    // Fallback vers le cache local
    const cachedEntries = getCachedEntries()
    const filteredEntries = cachedEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate.toDateString() === date.toDateString()
    })
    return filteredEntries
  }
}

// Fonction pour télécharger une photo
export const uploadPhoto = async (file: File, entryId: string): Promise<string> => {
  try {
    const photoUrl = await uploadPhotoToBlob(file, entryId)
    return photoUrl
  } catch (error) {
    console.error("Error uploading photo:", error)
    throw error
  }
}

// Fonctions pour les brouillons
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

// Fonction pour synchroniser les entrées locales avec Blob Storage
export const syncLocalEntriesToBlob = async () => {
  try {
    const localEntries = getCachedEntries()
    if (localEntries.length === 0) return

    console.log(`Syncing ${localEntries.length} local entries to Blob Storage`)

    // Sauvegarder chaque entrée dans Blob Storage
    const savePromises = localEntries.map((entry) => saveEntryToBlob(entry))
    await Promise.all(savePromises)

    console.log("Local entries successfully synced to Blob Storage")
  } catch (error) {
    console.error("Error syncing entries to Blob Storage:", error)
  }
}
