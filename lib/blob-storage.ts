import { put, list, del } from "@vercel/blob"
import type { JournalEntry } from "@/types/JournalEntry"

const ENTRIES_BLOB_PREFIX = "journal-entries/"
const PHOTOS_BLOB_PREFIX = "journal-photos/"

// Fonction pour sauvegarder une entrée de journal dans Blob Storage
export async function saveEntryToBlob(entry: JournalEntry, accessCode: string): Promise<string> {
  try {
    if (!accessCode || accessCode.trim() === "") {
      throw new Error("Empty access code provided to saveEntryToBlob")
    }

    if (!entry || !entry.id) {
      throw new Error("Invalid entry provided to saveEntryToBlob")
    }

    // Convertir l'entrée en JSON
    const entryJson = JSON.stringify(entry)

    // Créer un nom de fichier basé sur l'ID de l'entrée et le code d'accès
    const filename = `${ENTRIES_BLOB_PREFIX}${accessCode}/${entry.id}.json`

    console.log(`Saving entry to Blob Storage: ${filename}`)

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
export async function getAllEntriesFromBlob(accessCode: string): Promise<JournalEntry[]> {
  try {
    if (!accessCode || accessCode.trim() === "") {
      console.error("Empty access code provided to getAllEntriesFromBlob")
      return []
    }

    console.log(`Listing blobs with prefix: ${ENTRIES_BLOB_PREFIX}${accessCode}/`)

    // Lister tous les fichiers avec le préfixe des entrées et le code d'accès
    const { blobs } = await list({ prefix: `${ENTRIES_BLOB_PREFIX}${accessCode}/` })

    // Si aucun fichier n'est trouvé, retourner un tableau vide
    if (!blobs || blobs.length === 0) {
      console.log(`No entries found for access code: ${accessCode}`)
      return []
    }

    console.log(`Found ${blobs.length} entries for access code: ${accessCode}`)

    // Récupérer le contenu de chaque fichier
    const entriesPromises = blobs.map(async (blob) => {
      try {
        console.log(`Fetching entry from: ${blob.url}`)
        const response = await fetch(blob.url)

        if (!response.ok) {
          throw new Error(`Failed to fetch entry: ${response.statusText}`)
        }

        const entry = (await response.json()) as JournalEntry
        return entry
      } catch (error) {
        console.error(`Error fetching entry from ${blob.url}:`, error)
        return null
      }
    })

    // Attendre que toutes les entrées soient récupérées
    const entries = (await Promise.all(entriesPromises)).filter((entry) => entry !== null) as JournalEntry[]

    // Trier les entrées par date (plus récentes en premier)
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("Error getting entries from Blob Storage:", error)
    return []
  }
}

// Fonction pour supprimer une entrée de journal de Blob Storage
export async function deleteEntryFromBlob(entryId: string, accessCode: string): Promise<void> {
  try {
    const filename = `${ENTRIES_BLOB_PREFIX}${accessCode}/${entryId}.json`
    await del(filename)
    console.log(`Entry deleted from Blob Storage: ${entryId}`)
  } catch (error) {
    console.error("Error deleting entry from Blob Storage:", error)
    throw error
  }
}

// Fonction pour télécharger une photo dans Blob Storage
export async function uploadPhotoToBlob(file: File, entryId: string, accessCode: string): Promise<string> {
  try {
    // Créer un nom de fichier unique pour la photo
    const timestamp = Date.now()
    const filename = `${PHOTOS_BLOB_PREFIX}${accessCode}/${entryId}/${timestamp}-${file.name}`

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
