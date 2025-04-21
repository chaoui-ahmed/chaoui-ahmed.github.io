"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SupabaseDiagnostic() {
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const runDiagnostic = async () => {
    setIsLoading(true)
    setResults([])
    setSuccess(false)

    try {
      const logs: string[] = []
      logs.push("Démarrage du diagnostic Supabase...")

      // Vérifier les variables d'environnement
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      logs.push(`URL Supabase définie: ${!!supabaseUrl}`)
      logs.push(`Clé Supabase définie: ${!!supabaseKey}`)

      if (!supabaseUrl || !supabaseKey) {
        logs.push("❌ Variables d'environnement manquantes")
        setResults(logs)
        setIsLoading(false)
        return
      }

      // Créer un client Supabase
      logs.push("Création du client Supabase...")
      const supabase = createClient()

      // Tester la connexion en utilisant une méthode plus fiable
      logs.push("Test de connexion à Supabase...")
      try {
        // Utiliser la méthode auth.getSession() pour vérifier la connexion
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          logs.push(`❌ Erreur de connexion: ${sessionError.message}`)
          setResults(logs)
          setIsLoading(false)
          return
        }

        logs.push("✅ Connexion à Supabase réussie")
        logs.push(`Session: ${sessionData.session ? "Authentifiée" : "Non authentifiée"}`)

        // Vérifier si la table journal_entries existe
        logs.push("Vérification de la table journal_entries...")
        const { data, error } = await supabase.from("journal_entries").select("id").limit(1)

        if (error) {
          logs.push(`❌ Erreur d'accès à la table: ${error.message}`)
          logs.push(`Code: ${error.code}, Détails: ${JSON.stringify(error.details)}`)

          // Lister les tables disponibles
          logs.push("Tentative de liste des tables disponibles...")
          try {
            // Cette requête nécessite des privilèges élevés et peut échouer
            const { data: tablesData, error: tablesError } = await supabase.rpc("list_tables")

            if (tablesError) {
              logs.push(`Information: Impossible de lister les tables: ${tablesError.message}`)
            } else if (tablesData) {
              logs.push(`Tables disponibles: ${JSON.stringify(tablesData)}`)
            }
          } catch (tablesErr) {
            logs.push(
              `Information: Fonction RPC non disponible: ${tablesErr instanceof Error ? tablesErr.message : String(tablesErr)}`,
            )
          }

          // Suggestions
          logs.push("\nSuggestions de résolution:")
          logs.push("1. Vérifiez que la table 'journal_entries' existe bien dans votre base de données Supabase")
          logs.push("2. Vérifiez que les politiques RLS permettent l'accès anonyme à la table")
          logs.push("3. Vérifiez que le nom de la table est correct (sensible à la casse)")
          logs.push("4. Créez la table avec le script SQL suivant:")
          logs.push(`
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  hashtags TEXT[] NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  photos TEXT[] DEFAULT '{}'
);

-- Activer RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre toutes les opérations
CREATE POLICY "Enable all operations for all users" ON journal_entries
  USING (true)
  WITH CHECK (true);
          `)
        } else {
          logs.push("✅ Table journal_entries accessible")
          logs.push(`Données récupérées: ${JSON.stringify(data)}`)
          setSuccess(true)
        }
      } catch (error) {
        logs.push(`❌ Erreur de connexion: ${error instanceof Error ? error.message : String(error)}`)
        logs.push("Vérifiez votre connexion internet et les variables d'environnement Supabase")
        setResults(logs)
        setIsLoading(false)
        return
      }

      setResults(logs)
    } catch (error) {
      setResults(["❌ Erreur lors du diagnostic:", error instanceof Error ? error.message : String(error)])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8 shadow-md border border-black bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-orange-400">Diagnostic Supabase</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={runDiagnostic}
          disabled={isLoading}
          className="mb-4 bg-orange-300 hover:bg-orange-400 text-black"
        >
          {isLoading ? "Diagnostic en cours..." : "Lancer le diagnostic"}
        </Button>

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <AlertDescription>
              ✅ Connexion à Supabase réussie ! La table journal_entries est accessible.
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap">{results.join("\n")}</pre>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-semibold">Instructions pour résoudre les problèmes courants :</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>
              Vérifiez que la table <code>journal_entries</code> existe dans votre base de données Supabase
            </li>
            <li>Vérifiez que le nom de la table est en minuscules et correctement orthographié</li>
            <li>Activez les politiques RLS pour permettre l'accès anonyme à la table</li>
            <li>Vérifiez que les variables d'environnement sont correctement définies dans votre projet Vercel</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
