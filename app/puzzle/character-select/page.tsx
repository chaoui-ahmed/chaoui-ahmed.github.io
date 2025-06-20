"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function PuzzleCharacterSelectPage() {
  const router = useRouter()
  const { updateGameState } = useGame()

  const handleCharacterSelection = () => {
    updateGameState({ selectedCharacter: "anakin" })
    router.push("/puzzle/levels")
  }

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Mode Puzzle - Personnage</h2>
          <p className="text-white">Rejoignez Anakin dans ses défis</p>
        </div>

        <div className="cursor-pointer" onClick={handleCharacterSelection}>
          <GameCard
            character="Anakin Skywalker"
            showLightsaber={true}
            showButtons={true}
            buttons={[{ label: "COMMENCER", action: "start" }]}
            onButtonClick={handleCharacterSelection}
            className="hover:border-[#e3b700]"
            isLarge={true}
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
