"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGame } from "@/contexts/game-context"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

export default function LobbyCreatedPage() {
  const router = useRouter()
  const { gameState } = useGame()
  const [copied, setCopied] = useState(false)

  const copyLobbyCode = () => {
    navigator.clipboard.writeText(gameState.lobbyCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Serveur Créé avec Succès</h2>
          <p className="text-white">En attente des connexions...</p>
        </div>

        <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-96 mx-auto">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="w-20 h-20 bg-[#444444] rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#e2af00]">
                <span className="text-white text-xs">R2-D2</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-white text-sm mb-2">Adresse IP du Serveur</p>
                <p className="text-[#e2af00] font-bold text-lg">{gameState.lobbyName}</p>
              </div>

              <div>
                <p className="text-white text-sm mb-2">Port de Connexion</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#e2af00] font-bold text-2xl flex-1">14010</p>
                  <Button
                    onClick={copyLobbyCode}
                    variant="outline"
                    size="sm"
                    className="border-[#e2af00] text-[#e2af00] hover:bg-[#e2af00] hover:text-[#071b3f]"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-[#444444] rounded p-3">
                <p className="text-white text-sm">
                  Partagez cette adresse IP avec vos amis pour qu'ils puissent se connecter
                </p>
              </div>

              <Button
                onClick={() => router.push("/duo/multiplayer-game")}
                className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] font-bold"
              >
                COMMENCER LA PARTIE
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <button onClick={() => router.push("/duo/create")} className="text-[#e2af00] hover:text-[#e3b700] underline">
            ← Modifier les paramètres
          </button>
        </div>
      </div>
    </div>
  )
}
