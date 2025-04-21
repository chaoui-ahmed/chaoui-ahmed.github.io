"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { validateAccessCode } from "@/lib/storage"

interface AccessCodeLoginProps {
  onSuccess: () => void
}

export default function AccessCodeLogin({ onSuccess }: AccessCodeLoginProps) {
  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async () => {
    if (!accessCode.trim()) {
      toast({
        title: "Code d'accès requis",
        description: "Veuillez entrer un code d'accès pour continuer.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Valider le code d'accès
      const isValid = await validateAccessCode(accessCode)

      if (isValid) {
        toast({
          title: "Connexion réussie",
          description: "Votre code d'accès a été validé avec succès.",
          className: "bg-green-100 border-green-400 text-green-800",
        })

        onSuccess()
      } else {
        toast({
          title: "Code d'accès invalide",
          description: "Le code d'accès que vous avez entré n'est pas valide.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating access code:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation du code d'accès.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-black bg-white dark:bg-gray-800">
        <CardHeader className="bg-orange-100 dark:bg-orange-900/30">
          <CardTitle className="text-2xl text-orange-600 dark:text-orange-300">Accéder à votre journal</CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-400">
            Entrez votre code d'accès pour accéder à vos entrées de journal.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-gray-800 dark:text-gray-200">
                Code d'accès
              </Label>
              <Input
                id="accessCode"
                placeholder="Entrez votre code d'accès"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50">
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white"
          >
            {isLoading ? "Chargement des données..." : "Se connecter"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
