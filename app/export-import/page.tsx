"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import { exportData, importData } from "@/lib/storage"
import { Download, Upload, AlertTriangle } from "lucide-react"

export default function ExportImportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)
    try {
      const data = await exportData()

      // Créer un blob et un lien de téléchargement
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `journal-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Nettoyer
      URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Exportation réussie",
        description: "Vos données ont été exportées avec succès.",
        className: "bg-green-100 border-green-400 text-green-800",
      })
    } catch (err) {
      console.error("Error exporting data:", err)
      setError(`Erreur lors de l'exportation des données: ${err instanceof Error ? err.message : String(err)}`)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'exportation des données.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsImporting(true)
    setError(null)

    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          const jsonData = event.target?.result as string
          await importData(jsonData)

          toast({
            title: "Importation réussie",
            description: "Vos données ont été importées avec succès.",
            className: "bg-green-100 border-green-400 text-green-800",
          })
        } catch (err) {
          console.error("Error importing data:", err)
          setError(`Erreur lors de l'importation des données: ${err instanceof Error ? err.message : String(err)}`)
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de l'importation des données.",
            variant: "destructive",
          })
        } finally {
          setIsImporting(false)
        }
      }

      reader.onerror = () => {
        setError("Erreur lors de la lecture du fichier")
        setIsImporting(false)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la lecture du fichier.",
          variant: "destructive",
        })
      }

      reader.readAsText(file)
    } catch (err) {
      console.error("Error reading file:", err)
      setError(`Erreur lors de la lecture du fichier: ${err instanceof Error ? err.message : String(err)}`)
      setIsImporting(false)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la lecture du fichier.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Exporter / Importer</h1>

        <Card className="shadow-md border-2 border-black bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-orange-400 dark:text-orange-300 flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Exporter vos données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-black dark:text-white">
                Exportez toutes vos entrées de journal dans un fichier JSON que vous pourrez sauvegarder ou transférer.
              </p>

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full mt-4 bg-orange-300 hover:bg-orange-400 text-black dark:bg-orange-600 dark:hover:bg-orange-700 dark:text-white"
              >
                {isExporting ? "Exportation en cours..." : "Exporter mes données"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-2 border-black bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-orange-400 dark:text-orange-300 flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Importer des données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-black dark:text-white">
                Importez des entrées de journal à partir d'un fichier JSON exporté précédemment.
              </p>

              <Alert
                variant="warning"
                className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  L'importation remplacera toutes vos entrées existantes. Assurez-vous de faire une sauvegarde avant
                  d'importer.
                </AlertDescription>
              </Alert>

              <div className="mt-4">
                <input
                  type="file"
                  id="import-file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={isImporting}
                />
                <Button
                  onClick={() => document.getElementById("import-file")?.click()}
                  disabled={isImporting}
                  className="w-full bg-orange-300 hover:bg-orange-400 text-black dark:bg-orange-600 dark:hover:bg-orange-700 dark:text-white"
                >
                  {isImporting ? "Importation en cours..." : "Importer des données"}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
