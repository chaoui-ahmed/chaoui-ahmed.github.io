import { initializeApp } from "firebase/app"
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import type { JournalEntry } from "@/types/JournalEntry"

// Configuration Firebase (à remplacer par vos propres valeurs)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

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

    const entriesRef = collection(db, `users/${accessCode}/entries`)
    const querySnapshot = await getDocs(entriesRef)

    const entries: JournalEntry[] = []
    querySnapshot.forEach((doc) => {
      entries.push(doc.data() as JournalEntry)
    })

    // Trier par date (plus récentes en premier)
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("Error getting entries from Firebase:", error)
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

    const entryRef = doc(db, `users/${accessCode}/entries/${entry.id}`)
    await setDoc(entryRef, entry)
    console.log("Entry saved to Firebase")
  } catch (error) {
    console.error("Error saving entry to Firebase:", error)
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

    const entryRef = doc(db, `users/${accessCode}/entries/${entryId}`)
    await deleteDoc(entryRef)
    console.log("Entry deleted from Firebase")
  } catch (error) {
    console.error("Error deleting entry from Firebase:", error)
    throw error
  }
}

// Fonction pour rechercher des entrées par hashtag
export const searchEntriesByHashtag = async (hashtag: string): Promise<JournalEntry[]> => {
  // Firebase ne permet pas de rechercher dans des tableaux facilement,
  // donc nous récupérons toutes les entrées et filtrons côté client
  const entries = await getAllEntries()
  return entries.filter((entry) => entry.hashtags.some((tag) => tag.toLowerCase().includes(hashtag.toLowerCase())))
}

// Fonction pour rechercher des entrées par contenu
export const searchEntriesByContent = async (term: string): Promise<JournalEntry[]> => {
  // Firebase ne permet pas de recherche de texte complète facilement,
  // donc nous récupérons toutes les entrées et filtrons côté client
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

// Fonction pour télécharger une photo
export const uploadPhoto = async (file: File, entryId: string): Promise<string> => {
  try {
    const accessCode = getAccessCode()
    if (!accessCode) {
      throw new Error("No access code found")
    }

    const timestamp = Date.now()
    const storageRef = ref(storage, `users/${accessCode}/photos/${entryId}/${timestamp}-${file.name}`)

    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    console.log("Photo uploaded to Firebase Storage:", downloadURL)
    return downloadURL
  } catch (error) {
    console.error("Error uploading photo to Firebase Storage:", error)
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
      const entryRef = doc(db, `users/${accessCode}/entries/${entry.id}`)
      await setDoc(entryRef, entry)
    }

    console.log(`Imported ${entries.length} entries to Firebase`)
  } catch (error) {
    console.error("Error importing data to Firebase:", error)
    throw error
  }
}
