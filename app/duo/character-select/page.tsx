"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function DuoCharacterSelectPage() {
  const router = useRouter()
  const { updateGameState } = useGame()

  const handleAction = (action: string) => {
    if (action === "create") {
      router.push("/duo/create")
    } else if (action === "join") {
      router.push("/duo/join")
    }
  }

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Mode Duo - Multijoueur</h2>
          <p className="text-white">R2-D2 et C-3PO vous accompagnent</p>
        </div>

        <div className="flex gap-8 justify-center">
          <GameCard
            title="CREATE LOBBY"
            character="R2-D2"
            showButtons={true}
            buttons={[{ label: "CRÉER", action: "create" }]}
            onButtonClick={handleAction}
            className="hover:border-[#e3b700]"
          />

          <GameCard
            title="JOIN LOBBY"
            character="C-3PO"
            showButtons={true}
            buttons={[{ label: "REJOINDRE", action: "join" }]}
            onButtonClick={handleAction}
            className="hover:border-[#e3b700]"
          />
        </div>

        <div className="mt-8">
          <button onClick={() => router.push("/mode-select")} className="text-[#e2af00] hover:text-[#e3b700] underline">
            ← Retour aux modes
          </button>
        </div>
      </div>
    </div>
  )
}
