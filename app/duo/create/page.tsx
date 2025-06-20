"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGame } from "@/contexts/game-context"
import { useState } from "react"

export default function DuoCreatePage() {
  const router = useRouter()
  const { updateGameState } = useGame()
  const [lobbyName, setLobbyName] = useState("")

  const handleCreateLobby = () => {
    if (lobbyName) {
      const lobbyCode = lobbyName // Use IP as lobby code
      updateGameState({ lobbyName, lobbyCode })
      router.push("/duo/lobby-created")
    }
  }

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Créer un Serveur</h2>
          <p className="text-white">Configurez votre serveur de jeu</p>
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
                <label className="block text-white text-sm mb-2">Adresse IP du Serveur</label>
                <Input
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  placeholder="192.168.1.100 ou localhost"
                  className="bg-[#444444] border-[#e2af00] text-white"
                />
              </div>

              <Button
                onClick={handleCreateLobby}
                disabled={!lobbyName}
                className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] font-bold"
              >
                DÉMARRER LE SERVEUR
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <button
            onClick={() => router.push("/duo/character-select")}
            className="text-[#e2af00] hover:text-[#e3b700] underline"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  )
}
