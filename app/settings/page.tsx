"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import { getAccessCode, setAccessCode } from "@/lib/storage"
import { put } from "@vercel/blob"

export default function Settings() {
  const [bgColor, setBgColor] = useState("#f5f5f0") // Couleur par défaut
  const [accessCode, setAccessCodeState] = useState("")
  const [showAccessCode, setShowAccessCode] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [bgImage, setBgImage] = useState<File | null>(null)
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Récupérer le code d'accès actuel
    const currentCode = getAccessCode()
    if (currentCode) {
      setAccessCodeState(currentCode)
    }

    // Récupérer les préférences sauvegardées
    const savedBgColor = localStorage.getItem("bg_color")
    if (savedBgColor) {
      setBgColor(savedBgColor)
      document.body.style.backgroundColor = savedBgColor
    }

    const savedDarkMode = localStorage.getItem("dark_mode") === "true"
    setIsDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    const savedBgImageUrl = localStorage.getItem("bg_image_url")
    if (savedBgImageUrl) {
      setBgImageUrl(savedBgImageUrl)
      document.body.style.backgroundImage = `url(${savedBgImageUrl})`
      document.body.style.backgroundSize = "cover"
      document.body.style.backgroundPosition = "center"
    }
  }, [])

  const handleBgColorChange = (color: string) => {
    setBgColor(color)
    document.body.style.backgroundColor = color
    localStorage.setItem("bg_color", color)
  }

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked)
    localStorage.setItem("dark_mode", checked.toString())

    if (checked) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleSaveAccessCode = () => {
    if (!accessCode.trim()) {
      toast({
        title: "Code d'accès requis",
        description: "Veuillez entrer un code d'accès pour continuer.",
        variant: "destructive",
      })
      return
    }

    // Sauvegarder le code d'accès
    setAccessCode(accessCode)

    toast({
      title: "Code d'accès sauvegardé",
      description: "Votre code d'accès a été mis à jour avec succès.",
      className: "bg-green-100 border-green-400 text-green-800",
    })
  }

  const handleBgImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setBgImage(file)

    // Créer une URL de prévisualisation
    const previewUrl = URL.createObjectURL(file)
    document.body.style.backgroundImage = `url(${previewUrl})`
    document.body.style.backgroundSize = "cover"
    document.body.style.backgroundPosition = "center"
  }

  const handleUploadBgImage = async () => {
    if (!bgImage) return

    setIsUploading(true)
    try {
      // Récupérer le code d'accès
      const accessCode = getAccessCode()
      if (!accessCode) {
        throw new Error("No access code found")
      }

      // Créer un nom de fichier unique pour l'image
      const timestamp = Date.now()
      const filename = `journal-backgrounds/${accessCode}/${timestamp}-${bgImage.name}`

      // Télécharger l'image dans Blob Storage
      const blob = await put(filename, bgImage, {
        contentType: bgImage.type,
        access: "public",
      })

      // Sauvegarder l'URL de l'image
      setBgImageUrl(blob.url)
      localStorage.setItem("bg_image_url", blob.url)

      toast({
        title: "Image de fond téléchargée",
        description: "Votre image de fond a été téléchargée avec succès.",
        className: "bg-green-100 border-green-400 text-green-800",
      })
    } catch (error) {
      console.error("Error uploading background image:", error)
      toast({
        title: "Error",
        description: `Failed to upload background image: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Paramètres</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-orange-400 dark:text-orange-300">Personnalisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bgColor" className="text-black dark:text-white">
                    Couleur de Fond
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => handleBgColorChange(e.target.value)}
                      className="w-12 h-12 p-1 rounded border border-black dark:border-gray-600"
                    />
                    <span className="text-black dark:text-white">{bgColor}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bgImage" className="text-black dark:text-white">
                    Image de Fond
                  </Label>
                  <Input
                    id="bgImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageChange}
                    className="mt-2 border-black focus:border-orange-300 dark:border-gray-600 dark:text-white"
                  />
                  {bgImage && (
                    <Button
                      onClick={handleUploadBgImage}
                      disabled={isUploading}
                      className="mt-2 bg-orange-300 hover:bg-orange-400 text-black dark:bg-orange-600 dark:hover:bg-orange-700 dark:text-white"
                    >
                      {isUploading ? "Téléchargement..." : "Télécharger l'image"}
                    </Button>
                  )}
                  {bgImageUrl && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBgImageUrl(null)
                          localStorage.removeItem("bg_image_url")
                          document.body.style.backgroundImage = "none"
                          toast({
                            title: "Image de fond supprimée",
                            description: "Votre image de fond a été supprimée avec succès.",
                            className: "bg-green-100 border-green-400 text-green-800",
                          })
                        }}
                        className="text-red-500 border-red-500 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                      >
                        Supprimer l'image de fond
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Switch id="darkMode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
                  <Label htmlFor="darkMode" className="text-black dark:text-white">
                    Mode Sombre
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-orange-400 dark:text-orange-300">Synchronisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accessCode" className="text-black dark:text-white">
                    Code d'accès
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="accessCode"
                      type={showAccessCode ? "text" : "password"}
                      value={accessCode}
                      onChange={(e) => setAccessCodeState(e.target.value)}
                      className="border-black focus:border-orange-300 dark:border-gray-600 dark:text-white dark:bg-gray-700"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAccessCode(!showAccessCode)}
                      className="border-black dark:border-gray-600 dark:text-white"
                    >
                      {showAccessCode ? "Masquer" : "Afficher"}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleSaveAccessCode}
                  className="bg-orange-300 hover:bg-orange-400 text-black dark:bg-orange-600 dark:hover:bg-orange-700 dark:text-white"
                >
                  Sauvegarder le code d'accès
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ce code vous permet d'accéder à vos entrées de journal depuis n'importe quel appareil. Conservez-le
                  précieusement et ne le partagez avec personne.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
