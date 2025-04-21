"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getAccessCode, setAccessCode } from "@/lib/storage"

interface AccessCodeModalProps {
  onComplete: () => void
}

export default function AccessCodeModal({ onComplete }: AccessCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [accessCode, setAccessCodeState] = useState("")
  const [hasExistingCode, setHasExistingCode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si un code d'accès existe déjà
    const existingCode = getAccessCode()
    setHasExistingCode(!!existingCode)

    // Ouvrir la modal si aucun code n'existe
    if (!existingCode) {
      setIsOpen(true)
    } else {
      // Si un code existe déjà, on peut terminer directement
      onComplete()
    }
  }, [onComplete])

  const handleSaveCode = () => {
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
      description:
        "Votre code d'accès a été sauvegardé avec succès. Conservez-le pour accéder à vos données sur d'autres appareils.",
      className: "bg-green-100 border-green-400 text-green-800",
    })

    setIsOpen(false)
    onComplete()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
        <DialogHeader className="bg-orange-100 dark:bg-orange-900/30 p-4 -mx-6 -mt-6 rounded-t-lg">
          <DialogTitle className="text-orange-600 dark:text-orange-300">Code d'accès</DialogTitle>
          <DialogDescription className="text-orange-700 dark:text-orange-400">
            Créez un code d'accès pour pouvoir accéder à vos données depuis n'importe quel appareil.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accessCode" className="text-gray-800 dark:text-gray-200">
              Votre code d'accès
            </Label>
            <Input
              id="accessCode"
              placeholder="Entrez un code d'accès mémorable"
              value={accessCode}
              onChange={(e) => setAccessCodeState(e.target.value)}
              className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ce code vous permettra d'accéder à vos entrées de journal depuis n'importe quel appareil. Conservez-le
            précieusement et ne le partagez avec personne.
          </p>
        </div>
        <DialogFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 -mx-6 -mb-6 rounded-b-lg">
          <Button onClick={handleSaveCode} className="bg-orange-400 hover:bg-orange-500 text-white">
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
