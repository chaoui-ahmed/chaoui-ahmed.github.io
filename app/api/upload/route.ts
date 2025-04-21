import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const entryId = formData.get("entryId") as string

    if (!file || !entryId) {
      return NextResponse.json({ error: "File or entryId is missing" }, { status: 400 })
    }

    // Créer un nom de fichier unique pour la photo
    const timestamp = Date.now()
    const filename = `journal-photos/${entryId}/${timestamp}-${file.name}`

    // Télécharger le fichier dans Blob Storage
    const blob = await put(filename, file, {
      contentType: file.type,
      access: "public", // Les photos sont publiques pour simplifier
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
