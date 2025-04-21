"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import { getAllEntries, syncLocalEntriesToBlob, getAccessCode } from "@/lib/storage"
import { CloudIcon as CloudSync, Check, AlertTriangle } from "lucide-react"

export default function Sync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null)
  const [entriesCount, setEntriesCount] = useState(0)
  const [hasAccessCode, setHasAccessCode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si un code d'accès existe
    const accessCode = getAccessCode()
    setHasAccessCode(!!accessCode)

    // Récupérer la date de dernière synchronisation
    const lastSync = localStorage.getItem("last_sync_date")
    if (lastSync) {
      setLastSyncDate(new Date(lastSync))
    }

    // Récupérer le nombre d'entrées
    const loadEntries = async () => {
      const entries = await getAllEntries()
      setEntriesCount(entries.length)
    }
    loadEntries()
  }, [])

  const handleSync = async () => {
    if (!hasAccessCode) {
      toast({
        title: "Code d'accès requis",
        description: "Vous devez définir un code d'accès dans les paramètres pour synchroniser vos données.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)
    try {
      await syncLocalEntriesToBlob()

      // Mettre à jour la date de dernière synchronisation
      const now = new Date()
      localStorage.setItem("last_sync_date", now.toISOString())
      setLastSyncDate(now)

      toast({
        title: "Synchronisation réussie",
        description: "Vos entrées ont été synchronisées avec succès.",
        className: "bg-green-100 border-green-400 text-green-800",
      })
    } catch (error) {
      console.error("Error syncing entries:", error)
      toast({
        title: "Erreur de synchronisation",
        description: `Une erreur est survenue lors de la synchronisation: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black">Synchronisation</h1>
        <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-400">État de la synchronisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-black">Code d'accès configuré:</span>
                <span className="flex items-center">
                  {hasAccessCode ? (
                    <>
                      <Check className="h-5 w-5 text-green-500 mr-1" />
                      <span className="text-green-600">Oui</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-1" />
                      <span className="text-amber-600">Non</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black">Nombre d'entrées:</span>
                <span className="text-black">{entriesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black">Dernière synchronisation:</span>
                <span className="text-black">{lastSyncDate ? lastSyncDate.toLocaleString() : "Jamais"}</span>
              </div>
              <Button
                onClick={handleSync}
                disabled={isSyncing || !hasAccessCode}
                className="w-full mt-4 bg-orange-300 hover:bg-orange-400 text-black"
              >
                {isSyncing ? (
                  <>
                    <CloudSync className="mr-2 h-5 w-5 animate-spin" />
                    Synchronisation en cours...
                  </>
                ) : (
                  <>
                    <CloudSync className="mr-2 h-5 w-5" />
                    Synchroniser maintenant
                  </>
                )}
              </Button>
              {!hasAccessCode && (
                <p className="text-amber-600 text-sm mt-2">
                  Vous devez définir un code d'accès dans les paramètres pour synchroniser vos données.
                </p>
              )}
              <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="font-semibold text-black mb-2">Comment ça marche?</h3>
                <p className="text-sm text-gray-600">
                  La synchronisation permet de sauvegarder vos entrées de journal dans le cloud et d'y accéder depuis
                  n'importe quel appareil. Pour synchroniser vos données entre plusieurs appareils, utilisez le même
                  code d'accès sur chaque appareil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
