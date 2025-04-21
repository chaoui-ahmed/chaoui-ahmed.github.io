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
        // Sauvegarder le code d'accès
        setAccessCode(accessCode)

        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté à votre journal.",
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
    <Card className="w-full max-w-md mx-auto shadow-md border border-black bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-orange-400">Accéder à votre journal</CardTitle>
        <CardDescription>Entrez votre code d'accès pour accéder à vos entrées de journal.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessCode">Code d'accès</Label>
            <Input
              id="accessCode"
              placeholder="Entrez votre code d'accès"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-orange-300 hover:bg-orange-400 text-black"
        >
          {isLoading ? "Vérification..." : "Se connecter"}
        </Button>
      </CardFooter>
    </Card>
  )
}
