import type { JournalEntry } from "@/types/JournalEntry"

const DB_NAME = "journal_db"
const DB_VERSION = 1
const ENTRIES_STORE = "entries"
const SETTINGS_STORE = "settings"

let dbPromise: Promise<IDBDatabase> | null = null

// Initialiser la base de données
const initDB = (): Promise<IDBDatabase> => {
  if (typeof window === "undefined") {
    return Promise.reject("IndexedDB not available on server")
  }

  if (dbPromise) {
    return dbPromise
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      console.error("Error opening IndexedDB:", event)
      reject("Error opening IndexedDB")
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Créer le store pour les entrées
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        db.createObjectStore(ENTRIES_STORE, { keyPath: "id" })
      }

      // Créer le store pour les paramètres
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "key" })
      }
    }
  })

  return dbPromise
}

// Fonctions pour le code d'accès
export const getAccessCode = async (): Promise<string | null> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, "readonly")
      const store = transaction.objectStore(SETTINGS_STORE)
      const request = store.get("accessCode")

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null)
      }

      request.onerror = (event) => {
        console.error("Error getting access code:", event)
        reject("Error getting access code")
      }
    })
  } catch (error) {
    console.error("Error in getAccessCode:", error)
    return null
  }
}

export const setAccessCode = async (code: string): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, "readwrite")
      const store = transaction.objectStore(SETTINGS_STORE)
      const request = store.put({ key: "accessCode", value: code })

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        console.error("Error setting access code:", event)
        reject("Error setting access code")
      }
    })
  } catch (error) {
    console.error("Error in setAccessCode:", error)
  }
}

export const validateAccessCode = async (code: string): Promise<boolean> => {
  await setAccessCode(code)
  return true
}

// Fonction pour récupérer toutes les entrées
export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, "readonly")
      const store = transaction.objectStore(ENTRIES_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error getting entries:", event)
        reject("Error getting entries")
      }
    })
  } catch (error) {
    console.error("Error in getAllEntries:", error)
    return []
  }
}

// Fonction pour sauvegarder une entrée
export const saveEntry = async (entry: JournalEntry): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, "readwrite")
      const store = transaction.objectStore(ENTRIES_STORE)
      const request = store.put(entry)

      request.onsuccess = () => {
        console.log("Entry saved to IndexedDB")
        resolve()
      }

      request.onerror = (event) => {
        console.error("Error saving entry:", event)
        reject("Error saving entry")
      }
    })
  } catch (error) {
    console.error("Error in saveEntry:", error)
    throw error
  }
}

// Fonction pour supprimer une entrée
export const deleteEntry = async (entryId: string): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, "readwrite")
      const store = transaction.objectStore(ENTRIES_STORE)
      const request = store.delete(entryId)

      request.onsuccess = () => {
        console.log("Entry deleted from IndexedDB")
        resolve()
      }

      request.onerror = (event) => {
        console.error("Error deleting entry:", event)
        reject("Error deleting entry")
      }
    })
  } catch (error) {
    console.error("Error in deleteEntry:", error)
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
export const saveDraft = async (key: string, value: any): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, "readwrite")
      const store = transaction.objectStore(SETTINGS_STORE)
      const request = store.put({ key: `draft:${key}`, value })

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        console.error("Error saving draft:", event)
        reject("Error saving draft")
      }
    })
  } catch (error) {
    console.error("Error in saveDraft:", error)
  }
}

export const loadDraft = async (key: string): Promise<any> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, "readonly")
      const store = transaction.objectStore(SETTINGS_STORE)
      const request = store.get(`draft:${key}`)

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null)
      }

      request.onerror = (event) => {
        console.error("Error loading draft:", event)
        reject("Error loading draft")
      }
    })
  } catch (error) {
    console.error("Error in loadDraft:", error)
    return null
  }
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
    const db = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, "readwrite")
      const store = transaction.objectStore(ENTRIES_STORE)

      // Supprimer toutes les entrées existantes
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => {
        // Ajouter les nouvelles entrées
        let count = 0

        for (const entry of entries) {
          const request = store.add(entry)

          request.onsuccess = () => {
            count++
            if (count === entries.length) {
              resolve()
            }
          }

          request.onerror = (event) => {
            console.error("Error importing entry:", event)
            reject("Error importing entry")
          }
        }

        if (entries.length === 0) {
          resolve()
        }
      }

      clearRequest.onerror = (event) => {
        console.error("Error clearing entries:", event)
        reject("Error clearing entries")
      }
    })
  } catch (error) {
    console.error("Error importing data:", error)
    throw error
  }
}
