"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import { getAccessCode, getAllEntries } from "@/lib/storage"
import { Info, AlertTriangle, Database } from "lucide-react"

export default function BlobInfo() {
  const [accessCode, setAccessCode] = useState<string | null>(null)
  const [entriesCount, setEntriesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const code = getAccessCode()
        setAccessCode(code)

        if (code) {
          const entries = await getAllEntries()
          setEntriesCount(entries.length)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des données.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Gestion des données Blob</h1>

        <Card className="shadow-md border-2 border-black bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-orange-400 dark:text-orange-300 flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Informations sur vos données
            </CardTitle>
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
                <span className="text-black dark:text-white">{isLoading ? "Chargement..." : entriesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black dark:text-white">Stockage utilisé:</span>
                <span className="text-black dark:text-white">Vercel Blob Storage</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-2 border-black bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-orange-400 dark:text-orange-300 flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Gestion des données Blob
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-black dark:text-white">
                Vos données sont stockées dans Vercel Blob Storage. Voici comment vous pouvez les gérer:
              </p>

              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                <h3 className="font-semibold text-black dark:text-white mb-2">Structure des données</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Vos entrées de journal sont stockées avec la structure suivante:
                </p>
                <pre className="bg-gray-200 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto">
                  journal-entries/[votre-code-accès]/[id-entrée].json
                </pre>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                <h3 className="font-semibold text-black dark:text-white mb-2">Accès via le Dashboard Vercel</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Pour accéder directement à vos données dans Vercel Blob Storage:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Connectez-vous à votre compte Vercel</li>
                  <li>Accédez au projet contenant cette application</li>
                  <li>Allez dans l'onglet "Storage"</li>
                  <li>Sélectionnez "Blob"</li>
                  <li>Naviguez dans le dossier "journal-entries"</li>
                  <li>Trouvez le dossier correspondant à votre code d'accès</li>
                </ol>
              </div>

              <Alert
                variant="warning"
                className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-600 dark:text-amber-400">Attention</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  La modification directe des données dans Blob Storage peut entraîner des problèmes de compatibilité ou
                  des pertes de données. Utilisez cette méthode uniquement si vous savez ce que vous faites.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={() => window.history.back()}
            className="bg-orange-300 hover:bg-orange-400 text-black dark:bg-orange-600 dark:hover:bg-orange-700 dark:text-white"
          >
            Retour
          </Button>
        </div>
      </div>
    </div>
  )
}
