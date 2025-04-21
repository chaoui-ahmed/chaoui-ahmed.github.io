import type { JournalEntry } from "@/types/JournalEntry"

const ENTRIES_KEY = "journal_entries"
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
  // En mode localStorage, tous les codes sont valides
  setAccessCode(code)
  return true
}

// Fonction pour récupérer toutes les entrées
export const getAllEntries = async (): Promise<JournalEntry[]> => {
  if (typeof window === "undefined") return []

  const entriesJson = localStorage.getItem(ENTRIES_KEY)
  if (!entriesJson) return []

  try {
    return JSON.parse(entriesJson) as JournalEntry[]
  } catch (error) {
    console.error("Error parsing entries from localStorage:", error)
    return []
  }
}

// Fonction pour sauvegarder une entrée
export const saveEntry = async (entry: JournalEntry): Promise<void> => {
  if (typeof window === "undefined") return

  try {
    const entries = await getAllEntries()
    const existingIndex = entries.findIndex((e) => e.id === entry.id)

    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }

    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
    console.log("Entry saved to localStorage")
  } catch (error) {
    console.error("Error saving entry to localStorage:", error)
    throw error
  }
}

// Fonction pour supprimer une entrée
export const deleteEntry = async (entryId: string): Promise<void> => {
  if (typeof window === "undefined") return

  try {
    const entries = await getAllEntries()
    const filteredEntries = entries.filter((e) => e.id !== entryId)
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(filteredEntries))
    console.log("Entry deleted from localStorage")
  } catch (error) {
    console.error("Error deleting entry from localStorage:", error)
    throw error
  }
}

// Fonction pour rechercher des entrées par hashtag
export const searchEntriesByHashtag = async (hashtag: string): Promise<JournalEntry[]> => {
  const entries = await getAllEntries()
  return entries.filter((entry) => entry.hashtags.some((tag) => tag.toLowerCase().includes(hashtag.toLowerCase())))
}

// Fonction pour rechercher des entrées par contenu
export const searchEntriesByContent = async (term: string): Promise<JournalEntry[]> => {
  const entries = await getAllEntries()
  return entries.filter((entry) => entry.content.toLowerCase().includes(term.toLowerCase()))
}

// Fonction pour récupérer des entrées par date
export const getEntriesByDate = async (date: Date): Promise<JournalEntry[]> => {
  const entries = await getAllEntries()
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.toDateString() === date.toDateString()
  })
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

// Fonction pour télécharger une photo (stocke juste l'URL en base64)
export const uploadPhoto = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error("Error importing data:", error)
    throw error
  }
}
