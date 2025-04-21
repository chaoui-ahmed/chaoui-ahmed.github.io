import type { JournalEntry } from "@/types/JournalEntry"
import {
  saveEntryToBlob,
  getAllEntriesFromBlob,
  deleteEntryFromBlob,
  uploadPhotoToBlob,
  deletePhotoFromBlob,
} from "@/lib/blob-storage"

const CACHE_KEY = "journal_entries_cache"
const ACCESS_CODE_KEY = "journal_access_code"

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
  try {
    // Vérifier si le code existe dans Blob Storage
    const entries = await getAllEntriesFromBlob(code)

    if (entries.length > 0) {
      // Si des entrées existent avec ce code, on le sauvegarde et on charge les entrées
      setAccessCode(code)

      // Fusionner avec les entrées locales existantes
      const localEntries = getCachedEntries()
      const mergedEntries = mergeEntries(localEntries, entries)

      // Mettre à jour le cache local
      cacheEntries(mergedEntries)

      return true
    }

    return false
  } catch (error) {
    console.error("Error validating access code:", error)
    return false
  }
}

// Fonction pour fusionner les entrées locales et distantes
const mergeEntries = (localEntries: JournalEntry[], remoteEntries: JournalEntry[]): JournalEntry[] => {
  // Créer une map des entrées par ID pour faciliter la fusion
  const entriesMap = new Map<string, JournalEntry>()

  // Ajouter d'abord les entrées locales
  localEntries.forEach((entry) => {
    entriesMap.set(entry.id, entry)
  })

  // Ajouter ou remplacer par les entrées distantes (priorité aux entrées distantes)
  remoteEntries.forEach((entry) => {
    entriesMap.set(entry.id, entry)
  })

  // Convertir la map en tableau
  return Array.from(entriesMap.values())
}

// Fonction pour sauvegarder une entrée
export const saveEntry = async (entry: JournalEntry) => {
  try {
    // Récupérer le code d'accès
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

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

    // Sauvegarder dans Blob Storage avec le code d'accès
    await saveEntryToBlob(entry, accessCode)
    console.log("Entry saved to Blob Storage")
  } catch (error) {
    console.error("Error saving entry to Blob Storage:", error)
    // Déjà sauvegardé dans le cache local, donc pas besoin de le refaire
  }
}

// Fonction pour récupérer toutes les entrées
export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    // Récupérer le code d'accès
    const accessCode = getAccessCode()
    if (!accessCode) {
      // Si pas de code d'accès, utiliser le cache local
      const cachedEntries = getCachedEntries()
      console.log(`No access code found, using local cache (${cachedEntries.length} entries)`)
      return cachedEntries
    }

    // Essayer de récupérer depuis Blob Storage avec le code d'accès
    const entries = await getAllEntriesFromBlob(accessCode)
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
    // Récupérer le code d'accès
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    const photoUrl = await uploadPhotoToBlob(file, entryId, accessCode)
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

// Fonction pour synchroniser les entrées entre le local et Blob Storage
export const syncLocalEntriesToBlob = async () => {
  try {
    // Récupérer le code d'accès
    const accessCode = getAccessCode()
    if (!accessCode) {
      console.log("No access code found, cannot sync")
      return
    }

    // 1. Récupérer les entrées locales
    const localEntries = getCachedEntries()

    // 2. Récupérer les entrées distantes
    const remoteEntries = await getAllEntriesFromBlob(accessCode)

    // 3. Fusionner les entrées
    const mergedEntries = mergeEntries(localEntries, remoteEntries)

    // 4. Mettre à jour le cache local
    cacheEntries(mergedEntries)

    // 5. Sauvegarder toutes les entrées fusionnées dans Blob Storage
    const savePromises = mergedEntries.map((entry) => saveEntryToBlob(entry, accessCode))
    await Promise.all(savePromises)

    // 6. Enregistrer la date de synchronisation
    if (typeof window !== "undefined") {
      localStorage.setItem("last_sync_date", new Date().toISOString())
    }

    console.log(`Synchronized ${mergedEntries.length} entries between local and Blob Storage`)
    return mergedEntries.length
  } catch (error) {
    console.error("Error syncing entries:", error)
    throw error
  }
}

// Fonction pour supprimer une entrée
export const deleteEntry = async (entryId: string) => {
  try {
    // Récupérer le code d'accès
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    // Supprimer de Blob Storage
    await deleteEntryFromBlob(entryId, accessCode)
    console.log("Entry deleted from Blob Storage")

    // Supprimer du cache local
    const cachedEntries = getCachedEntries()
    const updatedEntries = cachedEntries.filter((entry) => entry.id !== entryId)
    cacheEntries(updatedEntries)
    console.log("Entry deleted from local cache")
  } catch (error) {
    console.error("Error deleting entry:", error)
  }
}

// Fonction pour supprimer une photo
export const deletePhoto = async (photoUrl: string) => {
  try {
    await deletePhotoFromBlob(photoUrl)
    console.log("Photo deleted from Blob Storage")
  } catch (error) {
    console.error("Error deleting photo:", error)
  }
}
