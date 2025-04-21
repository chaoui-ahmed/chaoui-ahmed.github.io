import { put, list, del } from "@vercel/blob"
import type { JournalEntry } from "@/types/JournalEntry"

const ENTRIES_BLOB_PREFIX = "journal-entries/"
const PHOTOS_BLOB_PREFIX = "journal-photos/"

// Fonction pour sauvegarder une entrée de journal dans Blob Storage
export async function saveEntryToBlob(entry: JournalEntry): Promise<string> {
  try {
    // Convertir l'entrée en JSON
    const entryJson = JSON.stringify(entry)

    // Créer un nom de fichier basé sur l'ID de l'entrée
    const filename = `${ENTRIES_BLOB_PREFIX}${entry.id}.json`

    // Sauvegarder le fichier dans Blob Storage
    const blob = await put(filename, entryJson, {
      contentType: "application/json",
      access: "public", // Les entrées sont publiques pour simplifier
    })

    console.log(`Entry saved to Blob Storage: ${blob.url}`)
    return blob.url
  } catch (error) {
    console.error("Error saving entry to Blob Storage:", error)
    throw error
  }
}

// Fonction pour récupérer toutes les entrées de journal depuis Blob Storage
export async function getAllEntriesFromBlob(): Promise<JournalEntry[]> {
  try {
    // Lister tous les fichiers avec le préfixe des entrées
    const { blobs } = await list({ prefix: ENTRIES_BLOB_PREFIX })

    // Si aucun fichier n'est trouvé, retourner un tableau vide
    if (!blobs || blobs.length === 0) {
      return []
    }

    // Récupérer le contenu de chaque fichier
    const entriesPromises = blobs.map(async (blob) => {
      const response = await fetch(blob.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch entry: ${response.statusText}`)
      }
      return (await response.json()) as JournalEntry
    })

    // Attendre que toutes les entrées soient récupérées
    const entries = await Promise.all(entriesPromises)

    // Trier les entrées par date (plus récentes en premier)
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("Error getting entries from Blob Storage:", error)
    throw error
  }
}

// Fonction pour supprimer une entrée de journal de Blob Storage
export async function deleteEntryFromBlob(entryId: string): Promise<void> {
  try {
    const filename = `${ENTRIES_BLOB_PREFIX}${entryId}.json`
    await del(filename)
    console.log(`Entry deleted from Blob Storage: ${entryId}`)
  } catch (error) {
    console.error("Error deleting entry from Blob Storage:", error)
    throw error
  }
}

// Fonction pour télécharger une photo dans Blob Storage
export async function uploadPhotoToBlob(file: File, entryId: string): Promise<string> {
  try {
    // Créer un nom de fichier unique pour la photo
    const timestamp = Date.now()
    const filename = `${PHOTOS_BLOB_PREFIX}${entryId}/${timestamp}-${file.name}`

    // Télécharger le fichier dans Blob Storage
    const blob = await put(filename, file, {
      contentType: file.type,
      access: "public", // Les photos sont publiques pour simplifier
    })

    console.log(`Photo uploaded to Blob Storage: ${blob.url}`)
    return blob.url
  } catch (error) {
    console.error("Error uploading photo to Blob Storage:", error)
    throw error
  }
}

// Fonction pour supprimer une photo de Blob Storage
export async function deletePhotoFromBlob(photoUrl: string): Promise<void> {
  try {
    // Extraire le chemin du fichier de l'URL
    const url = new URL(photoUrl)
    const pathname = url.pathname
    const filename = pathname.startsWith("/") ? pathname.substring(1) : pathname

    await del(filename)
    console.log(`Photo deleted from Blob Storage: ${photoUrl}`)
  } catch (error) {
    console.error("Error deleting photo from Blob Storage:", error)
    throw error
  }
}
