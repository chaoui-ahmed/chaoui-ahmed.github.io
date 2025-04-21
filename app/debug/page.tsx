"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import { getAccessCode, getAllEntries } from "@/lib/storage"
import { Bug, RefreshCw, AlertTriangle } from "lucide-react"

export default function DebugPage() {
  const [accessCode, setAccessCode] = useState<string | null>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Récupérer le code d'accès
      const code = getAccessCode()
      setAccessCode(code)

      if (code) {
        // Récupérer les entrées
        const entriesData = await getAllEntries()
        setEntries(entriesData)
      } else {
        setError("Aucun code d'accès trouvé. Veuillez définir un code d'accès dans les paramètres.")
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError(`Erreur lors du chargement des données: ${err instanceof Error ? err.message : String(err)}`)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des données.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white flex items-center">
          <Bug className="mr-2 h-6 w-6" />
          Page de débogage
        </h1>

        <Card className="shadow-md border-2 border-black bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-orange-400 dark:text-orange-300">Informations de base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-black dark:text-white">Code d'accès:</span>
                <span className="text-black dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {accessCode || "Non défini"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black dark:text-white">Nombre d'entrées:</span>
                <span className="text-black dark:text-white">{isLoading ? "Chargement..." : entries.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black dark:text-white">État:</span>
                <span className="text-black dark:text-white">
                  {isLoading ? "Chargement..." : error ? "Erreur" : "OK"}
                </span>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={loadData}
                disabled={isLoading}
                className="w-full mt-4 bg-orange-300 hover:bg-orange-400 text-black dark:bg-orange-600 dark:hover:bg-orange-700 dark:text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Rafraîchir les données
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-2 border-black bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-orange-400 dark:text-orange-300">Données des entrées</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-400 dark:text-orange-300" />
                <p className="mt-2 text-black dark:text-white">Chargement des données...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-black dark:text-white">Aucune entrée trouvée.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <div key={entry.id || index} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-x-auto">
                    <pre className="text-xs text-black dark:text-white whitespace-pre-wrap">
                      {JSON.stringify(entry, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
