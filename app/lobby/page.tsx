"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function LobbyPage() {
  const router = useRouter()
  const { updateGameState } = useGame()

  const handleCreateLobby = (mode: string) => {
    updateGameState({ gameMode: mode as "solo" | "alliance" })
    router.push("/battle")
  }

  const handleJoinLobby = () => {
    router.push("/battle")
  }

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Lobby Multijoueur</h2>
        </div>

        <div className="flex gap-8 justify-center">
          <GameCard
            title="CREATE A LOBBY"
            character="R2-D2 & C-3PO"
            showButtons={true}
            onButtonClick={handleCreateLobby}
            buttons={[
              { label: "SOLO 6 vs 1", action: "solo" },
              { label: "ALLIANCE", action: "alliance" },
            ]}
          />

          <GameCard
            title="JOIN A LOBBY"
            character="C-3PO"
            showButtons={true}
            onButtonClick={handleJoinLobby}
            buttons={[{ label: "REJOINDRE", action: "join" }]}
          />
        </div>

        <div className="mt-6">
          <button onClick={() => router.push("/game")} className="text-[#e2af00] hover:text-[#e3b700] underline">
            ← Retour au jeu
          </button>
        </div>
      </div>
    </div>
  )
}
