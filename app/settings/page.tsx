"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"

export default function Settings() {
  const [bgColor, setBgColor] = useState("#FFFFFF") // Couleur par défaut

  const handleBgColorChange = (color: string) => {
    setBgColor(color)
    document.body.style.backgroundColor = color
  }

  return (
    <div className="min-h-screen bg-white">
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
              <CardTitle className="text-orange-400">Préférences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language" className="text-black">
                    Langue
                  </Label>
                  <Select defaultValue="fr">
                    <SelectTrigger className="w-full mt-2 border-black focus:border-orange-300">
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notifications" className="text-black">
                    Notifications
                  </Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-full mt-2 border-black focus:border-orange-300">
                      <SelectValue placeholder="Fréquence des notifications" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="none">Aucune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
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
