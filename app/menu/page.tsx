"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function MenuPage() {
  const router = useRouter()
  const { updateGameState } = useGame()

  const handlePathSelection = (path: string) => {
    updateGameState({ selectedPath: path as "ai" | "puzzle" | "duo" })
    router.push("/character-select")
  }

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Menu Principal</h2>
        </div>

        <GameCard showButtons={true} onButtonClick={handlePathSelection} />

        <div className="mt-6">
          <button onClick={() => router.push("/")} className="text-[#e2af00] hover:text-[#e3b700] underline">
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
