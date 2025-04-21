"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Camera, Save, Hash, X, Upload, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveEntry, getAllEntries, saveDraft, loadDraft, uploadPhoto, syncLocalEntriesToBlob } from "@/lib/storage"
import type { JournalEntry } from "@/types/JournalEntry"
import Image from "next/image"

export default function JournalEntryComponent() {
  const [mood, setMood] = useState("neutre")
  const [content, setContent] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [hasEntryToday, setHasEntryToday] = useState(false)
  const [streak, setStreak] = useState(0)
  const [daysSinceLastEntry, setDaysSinceLastEntry] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([])
  const [isInitialSync, setIsInitialSync] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Synchroniser d'abord les données
        if (isInitialSync) {
          setIsSyncing(true)
          try {
            await syncLocalEntriesToBlob()
          } catch (error) {
            console.error("Error during initial sync:", error)
          } finally {
            setIsSyncing(false)
            setIsInitialSync(false)
          }
        }

        const entries = await getAllEntries()
        const today = new Date().toDateString()

        // Vérifier s'il y a une entrée aujourd'hui
        const todayEntry = entries.find((entry) => new Date(entry.date).toDateString() === today)
        setHasEntryToday(!!todayEntry)

        // Calculer le streak et les jours sans entrée
        if (entries.length > 0) {
          const dates = entries.map((entry) => new Date(entry.date))
          const lastEntryDate = new Date(Math.max(...dates.map((d) => d.getTime())))
          const daysSince = Math.floor((new Date().getTime() - lastEntryDate.getTime()) / (1000 * 3600 * 24))
          setDaysSinceLastEntry(daysSince)

          // Calculer le streak
          let currentStreak = 0
          const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime())
          const checkDate = new Date()

          for (const date of sortedDates) {
            if (date.toDateString() === checkDate.toDateString()) {
              currentStreak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
          setStreak(currentStreak)
        }

        // Charger le brouillon en cours
        const savedContent = loadDraft("content")
        const savedMood = loadDraft("mood")
        const savedHashtags = loadDraft("hashtags")
        const savedPhotos = loadDraft("photos")

        if (savedContent) setContent(savedContent)
        if (savedMood) setMood(savedMood)
        if (savedHashtags) setHashtags(savedHashtags)
        if (savedPhotos) {
          setPhotos(savedPhotos)
          setPreviewPhotos(savedPhotos)
        }
      } catch (error) {
        console.error("Error loading entries:", error)
        toast({
          title: "Error",
          description: `Failed to load entries: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [toast, isInitialSync])

  // Sauvegarder le brouillon automatiquement
  useEffect(() => {
    const saveDraftData = () => {
      try {
        saveDraft("content", content)
        saveDraft("mood", mood)
        saveDraft("hashtags", hashtags)
        saveDraft("photos", photos)
      } catch (error) {
        console.error("Error saving draft:", error)
        toast({
          title: "Error",
          description: "Failed to save draft. Your changes may not be preserved.",
          variant: "destructive",
        })
      }
    }

    saveDraftData()
  }, [content, mood, hashtags, photos, toast])

  const handleMoodChange = (value: string) => {
    setMood(value)
    if (value === "parfait") {
      toast({
        title: "Excellent choix !",
        description: "Bien, c'est ma couleur préf :)",
        className: "bg-purple-100 border-purple-400 text-purple-800",
      })
    }
  }

  const handleSave = async () => {
    try {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        content,
        mood,
        hashtags: hashtags.split(" ").filter((tag) => tag.length > 0),
        date: new Date().toISOString(),
        photos: photos,
      }

      await saveEntry(entry)

      // Effacer le brouillon
      saveDraft("content", "")
      saveDraft("mood", "neutre")
      saveDraft("hashtags", "")
      saveDraft("photos", [])

      toast({
        title: "Entrée sauvegardée",
        description: "Votre pixel du jour a été enregistré avec succès.",
        className: "bg-orange-100 border-orange-400 text-orange-800",
      })

      setContent("")
      setMood("neutre")
      setHashtags("")
      setPhotos([])
      setPreviewPhotos([])
      setHasEntryToday(true)

      // Synchroniser après la sauvegarde
      handleSync()
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({
        title: "Error",
        description: `Failed to save entry: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncLocalEntriesToBlob()
      toast({
        title: "Synchronisation réussie",
        description: "Vos entrées ont été synchronisées avec Blob Storage.",
        className: "bg-green-100 border-green-400 text-green-800",
      })
    } catch (error) {
      console.error("Error syncing entries:", error)
      toast({
        title: "Error",
        description: `Failed to sync entries: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Vérifier si le nombre maximum de photos est atteint
    if (photos.length + files.length > 5) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez pas ajouter plus de 5 photos par entrée.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Créer un ID temporaire pour l'entrée si elle n'existe pas encore
      const tempEntryId = Date.now().toString()

      // Télécharger chaque fichier
      const newPhotos: string[] = []
      const newPreviewPhotos: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Créer une URL de prévisualisation
        const previewUrl = URL.createObjectURL(file)
        newPreviewPhotos.push(previewUrl)

        // Télécharger la photo
        const photoUrl = await uploadPhoto(file, tempEntryId)
        newPhotos.push(photoUrl)
      }

      // Mettre à jour les photos
      setPhotos((prev) => [...prev, ...newPhotos])
      setPreviewPhotos((prev) => [...prev, ...newPreviewPhotos])

      toast({
        title: "Photos téléchargées",
        description: `${newPhotos.length} photo(s) ajoutée(s) avec succès.`,
        className: "bg-green-100 border-green-400 text-green-800",
      })
    } catch (error) {
      console.error("Error uploading photos:", error)
      toast({
        title: "Error",
        description: `Failed to upload photos: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviewPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md border border-black bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-orange-400">Nouveau Pixel</CardTitle>
        <div className="flex justify-between text-sm text-black">
          <span>Série actuelle : {streak} jours</span>
          <span>Jours sans pixel : {daysSinceLastEntry}</span>
        </div>
      </CardHeader>
      <CardContent>
        {isInitialSync && (
          <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synchronisation des données en cours...
            </AlertDescription>
          </Alert>
        )}
        {hasEntryToday && (
          <Alert className="mb-4 bg-orange-50 text-orange-800 border-orange-200">
            <AlertDescription>Vous avez déjà créé un pixel aujourd'hui. Vous pouvez le modifier.</AlertDescription>
          </Alert>
        )}
        <Textarea
          placeholder="Capturez votre journée ici..."
          className="min-h-[200px] mb-4 border-black focus:border-orange-300 bg-white/90"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mb-4">
          <Label className="text-black">Comment vous sentez-vous aujourd'hui ?</Label>
          <RadioGroup
            defaultValue="neutre"
            value={mood}
            onValueChange={handleMoodChange}
            className="flex flex-wrap gap-2 mt-2"
          >
            {[
              { value: "parfait", color: "bg-purple-200", label: "Parfait" },
              { value: "bien", color: "bg-blue-200", label: "Bien" },
              { value: "ca_va", color: "bg-green-200", label: "Ça va" },
              { value: "bof", color: "bg-yellow-200", label: "Bof" },
              { value: "pas_ouf", color: "bg-red-200", label: "Pas ouf" },
            ].map((item) => (
              <div key={item.value} className="flex items-center space-x-2">
                <RadioGroupItem value={item.value} id={item.value} className={item.color} />
                <Label htmlFor={item.value}>{item.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="mb-4">
          <Label htmlFor="hashtags" className="text-black">
            Hashtags
          </Label>
          <div className="flex items-center mt-2">
            <Hash className="mr-2 h-4 w-4 text-orange-400" />
            <Input
              id="hashtags"
              placeholder="Ajoutez des hashtags... (séparés par des espaces)"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="border-black focus:border-orange-300 bg-white/90"
            />
          </div>
        </div>

        {/* Prévisualisation des photos */}
        {previewPhotos.length > 0 && (
          <div className="mb-4">
            <Label className="text-black mb-2 block">Photos ({previewPhotos.length}/5)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {previewPhotos.map((photoUrl, index) => (
                <div key={index} className="relative h-24 rounded-md overflow-hidden">
                  <Image
                    src={photoUrl || "/placeholder.svg"}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input file caché */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={isUploading || photos.length >= 5}
        />
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <Button
          variant="outline"
          className="border-black text-black hover:bg-orange-50 hover:text-orange-400"
          onClick={handlePhotoClick}
          disabled={isUploading || photos.length >= 5}
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Ajouter une Photo ({photos.length}/5)
            </>
          )}
        </Button>
        <Button onClick={handleSave} className="bg-orange-300 hover:bg-orange-400 text-black">
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder le Pixel
        </Button>
        <Button onClick={handleSync} disabled={isSyncing} className="bg-purple-300 hover:bg-purple-400 text-black">
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Synchronisation...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Synchroniser
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
