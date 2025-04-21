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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Code d'accès</DialogTitle>
          <DialogDescription>
            Créez un code d'accès pour pouvoir accéder à vos données depuis n'importe quel appareil.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accessCode">Votre code d'accès</Label>
            <Input
              id="accessCode"
              placeholder="Entrez un code d'accès mémorable"
              value={accessCode}
              onChange={(e) => setAccessCodeState(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-500">
            Ce code vous permettra d'accéder à vos entrées de journal depuis n'importe quel appareil. Conservez-le
            précieusement et ne le partagez avec personne.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveCode} className="bg-orange-300 hover:bg-orange-400 text-black">
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
