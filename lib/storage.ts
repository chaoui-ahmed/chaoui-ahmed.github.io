import type { JournalEntry } from "@/types/JournalEntry"
import {
  saveEntryToBlob,
  getAllEntriesFromBlob,
  deleteEntryFromBlob,
  uploadPhotoToBlob,
  deletePhotoFromBlob,
} from "@/lib/blob-storage"

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
  try {
    // Vérifier si le code existe dans Blob Storage
    const entries = await getAllEntriesFromBlob(code)

    if (entries.length > 0) {
      // Si des entrées existent avec ce code, on le sauvegarde
      setAccessCode(code)
      return true
    }

    return false
  } catch (error) {
    console.error("Error validating access code:", error)
    return false
  }
}

// Fonction pour sauvegarder une entrée
export const saveEntry = async (entry: JournalEntry) => {
  try {
    // Récupérer le code d'accès
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    // Sauvegarder dans Blob Storage avec le code d'accès
    await saveEntryToBlob(entry, accessCode)
    console.log("Entry saved to Blob Storage")
  } catch (error) {
    console.error("Error saving entry to Blob Storage:", error)
    throw error
  }
}

// Fonction pour récupérer toutes les entrées
export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    // Récupérer le code d'accès
    const accessCode = getAccessCode()
    if (!accessCode) {
      console.log("No access code found, returning empty array")
      return []
    }

    // Récupérer depuis Blob Storage avec le code d'accès
    const entries = await getAllEntriesFromBlob(accessCode)
    console.log(`Retrieved ${entries.length} entries from Blob Storage`)
    return entries
  } catch (error) {
    console.error("Error getting entries from Blob Storage:", error)
    return []
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
    return []
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
    return []
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
    return []
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
    }
  } catch (error) {
    console.error("Error saving draft:", error)
  }
}

export const loadDraft = (key: string) => {
  try {
    if (typeof window === "undefined") return null
    const draft = localStorage.getItem(`draft:${key}`)
    return draft ? JSON.parse(draft) : null
  } catch (error) {
    console.error("Error loading draft:", error)
    return null
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
  } catch (error) {
    console.error("Error deleting entry:", error)
    throw error
  }
}

// Fonction pour supprimer une photo
export const deletePhoto = async (photoUrl: string) => {
  try {
    await deletePhotoFromBlob(photoUrl)
    console.log("Photo deleted from Blob Storage")
  } catch (error) {
    console.error("Error deleting photo:", error)
    throw error
  }
}

export const syncLocalEntriesToBlob = async (): Promise<number> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    const allEntries = await getAllEntries()
    let syncedCount = 0

    for (const entry of allEntries) {
      await saveEntryToBlob(entry, accessCode)
      syncedCount++
    }

    return syncedCount
  } catch (error) {
    console.error("Error syncing local entries to Blob Storage:", error)
    throw error
  }
}
