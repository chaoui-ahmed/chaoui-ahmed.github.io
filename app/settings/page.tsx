"use client"

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

export default function Settings() {
  const [bgColor, setBgColor] = useState("#FFFFFF") // Couleur par défaut
  const [accessCode, setAccessCodeState] = useState("")
  const [showAccessCode, setShowAccessCode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Récupérer le code d'accès actuel
    const currentCode = getAccessCode()
    if (currentCode) {
      setAccessCodeState(currentCode)
    }
  }, [])

  const handleBgColorChange = (color: string) => {
    setBgColor(color)
    document.body.style.backgroundColor = color
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

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black">Paramètres</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400">Personnalisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bgColor" className="text-black">
                    Couleur de Fond
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => handleBgColorChange(e.target.value)}
                      className="w-12 h-12 p-1 rounded border border-black"
                    />
                    <span className="text-black">{bgColor}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bgImage" className="text-black">
                    Image de Fond
                  </Label>
                  <Input id="bgImage" type="file" className="mt-2 border-black focus:border-orange-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400">Synchronisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accessCode" className="text-black">
                    Code d'accès
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="accessCode"
                      type={showAccessCode ? "text" : "password"}
                      value={accessCode}
                      onChange={(e) => setAccessCodeState(e.target.value)}
                      className="border-black focus:border-orange-300"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAccessCode(!showAccessCode)}
                      className="border-black"
                    >
                      {showAccessCode ? "Masquer" : "Afficher"}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSaveAccessCode} className="bg-orange-300 hover:bg-orange-400 text-black">
                  Sauvegarder le code d'accès
                </Button>
                <p className="text-sm text-gray-600">
                  Ce code vous permet d'accéder à vos entrées de journal depuis n'importe quel appareil. Conservez-le
                  précieusement et ne le partagez avec personne.
                </p>
                <div className="flex items-center space-x-2 pt-4">
                  <Switch id="darkMode" />
                  <Label htmlFor="darkMode" className="text-black">
                    Mode Sombre
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
